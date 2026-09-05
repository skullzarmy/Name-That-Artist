/**
 * objkt.com GraphQL API Integration
 * Fetches NFT tokens from The Tezos Community wallet
 */

import { GraphQLClient, gql } from "graphql-request";
import rateKeeperPkg from "rate-keeper";
const { default: RateKeeper, DropPolicy } = rateKeeperPkg;

const OBJKT_GRAPHQL_ENDPOINT = "https://data.objkt.com/v3/graphql";
const TTC_WALLET_ADDRESS = "tz1RZN17j7FuPtDpGpXKgMXbx57WEhpZGF6B";
const IPFS_GATEWAY = "https://ipfs.fileship.xyz";

/**
 * Convert IPFS URI to a gateway URL
 * @param {string} uri - IPFS URI (e.g., 'ipfs://Qm...' or 'ipfs://ipfs/Qm...')
 * @returns {string} Gateway URL (e.g., 'https://ipfs.fileship.xyz/Qm...')
 */
function convertIpfsToGateway(uri) {
    if (!uri || typeof uri !== "string") {
        return uri;
    }

    // Handle ipfs:// URIs
    if (uri.startsWith("ipfs://")) {
        // Remove 'ipfs://' prefix
        let cid = uri.slice(7);

        // Some URIs may have an extra '/ipfs/' prefix after 'ipfs://'
        if (cid.startsWith("ipfs/")) {
            cid = cid.slice(5);
        }

        return `${IPFS_GATEWAY}/${cid}`;
    }

    // Return as-is if not an IPFS URI
    return uri;
}

// GraphQL client
const client = new GraphQLClient(OBJKT_GRAPHQL_ENDPOINT);

// Rate limiting configuration for objkt.com API
// Based on observed 429 errors, using conservative rate limits
const OBJKT_RATE_LIMIT_MS = 1000; // 1 second between requests
const OBJKT_QUEUE_ID = "objkt-api";

// Rate-limited request function
const rateLimitedRequest = RateKeeper(
    async (query, variables) => {
        try {
            return await client.request(query, variables);
        } catch (error) {
            // If we still get rate limited, throw with more context
            if (error.response?.status === 429) {
                console.warn("⚠️ Still hitting rate limits, consider increasing delay");
                throw new Error(`Rate limit exceeded for objkt.com API. ${error.message}`);
            }
            throw error;
        }
    },
    OBJKT_RATE_LIMIT_MS,
    {
        id: OBJKT_QUEUE_ID,
        maxQueueSize: 100, // Reasonable queue size
        dropPolicy: DropPolicy.Reject, // Reject if queue is full rather than dropping
    }
);

/**
 * GraphQL query to fetch tokens from a wallet
 * Only fetches tokens with quantity > 0 (currently owned, not historical)
 */
const TOKENS_QUERY = gql`
    query GetWalletTokens($address: String!, $limit: Int!, $offset: Int!) {
        holder(where: { address: { _eq: $address } }) {
            held_tokens(offset: $offset, limit: $limit, distinct_on: token_pk, where: { quantity: { _gt: 0 } }) {
                quantity
                token {
                    token_id
                    name
                    description
                    artifact_uri
                    display_uri
                    thumbnail_uri
                    fa_contract
                    creators {
                        creator_address
                    }
                }
            }
        }
    }
`;

/**
 * GraphQL query to fetch artist info (alias, tzdomain, etc.)
 */
const ARTIST_INFO_QUERY = gql`
    query GetArtistInfo($address: String!) {
        holder(where: { address: { _eq: $address } }) {
            tzdomain
            alias
            description
            logo
        }
    }
`;

/**
 * Fetch tokens from the TTC wallet with pagination
 * @param {number} limit - Number of tokens per page
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of tokens
 */
export async function fetchTokensFromWallet(limit = 100, offset = 0) {
    try {
        const data = await rateLimitedRequest(TOKENS_QUERY, {
            address: TTC_WALLET_ADDRESS,
            limit,
            offset,
        });

        if (!data.holder || !data.holder[0]) {
            return [];
        }

        return data.holder[0].held_tokens.map((ht) => ht.token);
    } catch (error) {
        console.error("Error fetching tokens from objkt.com:", error);
        throw error;
    }
}

/**
 * Fetch all tokens from the TTC wallet (handles pagination)
 * @param {number} batchSize - Number of tokens to fetch per request
 * @returns {Promise<Array>} All tokens from the wallet
 */
export async function fetchAllTokens(batchSize = 100) {
    const allTokens = [];
    let offset = 0;
    let hasMore = true;

    console.log("📦 Fetching tokens from TTC wallet...");

    while (hasMore) {
        try {
            const tokens = await fetchTokensFromWallet(batchSize, offset);

            if (tokens.length === 0) {
                hasMore = false;
            } else {
                allTokens.push(...tokens);
                offset += tokens.length;
                console.log(`   Fetched ${allTokens.length} tokens so far...`);

                // If we got less than the batch size, we've reached the end
                if (tokens.length < batchSize) {
                    hasMore = false;
                }
            }
        } catch (error) {
            console.error(`Error at offset ${offset}:`, error.message);
            hasMore = false;
        }
    }

    console.log(`✅ Total tokens fetched: ${allTokens.length}`);
    return allTokens;
}

/**
 * Normalize token data for game use
 * @param {Object} token - Raw token data from API
 * @returns {Object} Normalized token data
 */
export function normalizeToken(token) {
    // Prioritize thumbnail for faster loading, fallback to display_uri or artifact_uri
    const thumbnailUrl = token.thumbnail_uri || token.display_uri || token.artifact_uri;
    // Full image URL for precaching or higher quality display
    const fullImageUrl = token.display_uri || token.artifact_uri || token.thumbnail_uri;

    // Extract artist addresses
    const artists = token.creators?.map((c) => c.creator_address) || [];
    const primaryArtist = artists[0] || "Unknown Artist";

    return {
        tokenId: token.token_id,
        name: token.name || "Untitled",
        description: token.description || "",
        imageUrl: convertIpfsToGateway(thumbnailUrl) || null,
        fullImageUrl: convertIpfsToGateway(fullImageUrl) || null,
        artists: artists,
        primaryArtist: primaryArtist,
        contract: token.fa_contract,
    };
}

/**
 * Get unique artists from token list
 * @param {Array} tokens - Array of normalized tokens
 * @returns {Array} Array of unique artist addresses
 */
export function getUniqueArtists(tokens) {
    const artistSet = new Set();

    tokens.forEach((token) => {
        if (token.artists && token.artists.length > 0) {
            token.artists.forEach((artist) => artistSet.add(artist));
        }
    });

    return Array.from(artistSet);
}

/**
 * Build a catalog of distinct contracts present in a token list, for admin
 * search/autocomplete (e.g. the ignore-list feature)
 * @param {Array} tokens - Array of normalized tokens
 * @returns {Array<{contract: string, label: string, count: number}>}
 */
export function buildContractCatalog(tokens) {
    const catalog = new Map();

    tokens.forEach((token) => {
        if (!token.contract) return;

        const existing = catalog.get(token.contract);
        if (existing) {
            existing.count++;
        } else {
            catalog.set(token.contract, {
                contract: token.contract,
                label: token.name || token.contract,
                count: 1,
            });
        }
    });

    return Array.from(catalog.values());
}

/**
 * Fetch artist info (alias, tzdomain) for a wallet address
 * @param {string} address - Tezos wallet address
 * @returns {Promise<Object|null>} Artist info or null
 */
export async function fetchArtistInfo(address) {
    try {
        const data = await rateLimitedRequest(ARTIST_INFO_QUERY, { address });

        if (!data.holder || !data.holder[0]) {
            return null;
        }

        return data.holder[0];
    } catch (error) {
        console.error(`Error fetching artist info for ${address}:`, error.message);
        return null;
    }
}

/**
 * Resolve artist display name with failover
 * Priority: alias -> tzdomain -> wallet address
 * @param {string} address - Tezos wallet address
 * @param {Object} artistInfoCache - Cache of artist info to avoid repeated API calls
 * @returns {Promise<Object>} Object with displayName and hasResolution
 */
export async function resolveArtistName(address, artistInfoCache = {}) {
    // Check cache first
    if (artistInfoCache[address]) {
        const info = artistInfoCache[address];
        const displayName = info.alias || info.tzdomain || address;
        const hasResolution = !!(info.alias || info.tzdomain);
        return { displayName, hasResolution, info };
    }

    // Fetch artist info
    const info = await fetchArtistInfo(address);

    if (!info) {
        return {
            displayName: address,
            hasResolution: false,
            info: null,
        };
    }

    // Store in cache
    artistInfoCache[address] = info;

    // Priority: alias -> tzdomain -> wallet address
    const displayName = info.alias || info.tzdomain || address;
    const hasResolution = !!(info.alias || info.tzdomain);

    return { displayName, hasResolution, info };
}

/**
 * Batch resolve artist names for multiple addresses
 * @param {Array<string>} addresses - Array of Tezos wallet addresses
 * @returns {Promise<Object>} Map of address to resolved name info
 */
export async function batchResolveArtistNames(addresses) {
    const artistInfoMap = {};

    console.log(`🔍 Resolving artist names for ${addresses.length} unique artists...`);
    console.log(`⏱️ Using rate limiting (${OBJKT_RATE_LIMIT_MS}ms between requests) to avoid API limits...`);

    // Process sequentially with rate limiting (no parallel processing to avoid rate limits)
    // The rate limiting happens automatically in rateLimitedRequest
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        try {
            const result = await resolveArtistName(address, artistInfoMap);
            artistInfoMap[address] = result;

            // Log progress every 50 artists or at the end
            if ((i + 1) % 50 === 0 || i === addresses.length - 1) {
                console.log(`   Resolved ${i + 1}/${addresses.length} artists...`);
            }
        } catch (error) {
            console.error(`   Failed to resolve artist ${address}:`, error.message);
            // Continue with next artist, don't let one failure stop the whole process
            artistInfoMap[address] = {
                displayName: address,
                hasResolution: false,
                info: null,
            };
        }
    }

    const resolvedCount = Object.values(artistInfoMap).filter((a) => a.hasResolution).length;
    console.log(`✅ Artist resolution complete: ${resolvedCount}/${addresses.length} resolved to alias/domain`);

    return artistInfoMap;
}

/**
 * Get random distractors (wrong answers) for a token
 * @param {Object} correctToken - The correct token
 * @param {Array} allArtists - All available artists
 * @param {number} count - Number of distractors needed
 * @returns {Array} Array of distractor artist addresses
 */
export function getDistractors(correctToken, allArtists, count = 3) {
    const correctArtist = correctToken.primaryArtist;
    const availableArtists = allArtists.filter((artist) => artist !== correctArtist);

    // Shuffle and pick random distractors
    const shuffled = availableArtists.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
