import {
  Client,
  Account,
  ID,
  Databases,
  OAuthProvider,
  Avatars,
  Query,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
  platform: "com.mk.restate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  whislistCollectionId: process.env.EXPO_PUBLIC_APPWRITE_WISHLIST_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
};

export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getProperties({
  filter,
  query,
  limit,
  propertyType,
  lowestPrice,
  highestPrice,
  bedrooms,
  bathrooms,
  userId,
}: {
  filter: string;
  query: string;
  limit?: number;
  propertyType?: any;
  lowestPrice?: number;
  highestPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  userId?: string;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (propertyType && propertyType.length > 0) {
      buildQuery.push(
        Query.or(propertyType.map((item: any) => Query.equal("type", item)))
      );
    } else {
      if (filter && filter !== "All") {
        buildQuery.push(Query.equal("type", filter));
      }
    }
    console.log(buildQuery);
    if (lowestPrice && highestPrice) {
      buildQuery.push(Query.between("price", lowestPrice, highestPrice));
    }

    if (bedrooms) buildQuery.push(Query.equal("bedrooms", bedrooms));
    if (bathrooms) buildQuery.push(Query.equal("bathrooms", bathrooms));

    if (query) {
      buildQuery.push(
        Query.or([
          Query.contains("name", query),
          Query.contains("address", query),
          Query.contains("type", query),
        ])
      );
    }

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    const properties = result.documents;

    if (userId) {
      const wishlistResult = await databases.listDocuments(
        config.databaseId!,
        config.whislistCollectionId!,
        [Query.equal("userId", userId)]
      );
      const wishlistPropertyIds = new Set(
        wishlistResult.documents.map((doc) => doc.propertyId)
      );

      return properties.map((property) => ({
        ...property,
        isInWishlist: wishlistPropertyIds.has(property.$id),
      }));
    }

    return properties.map((property) => ({
      ...property,
      isInWishlist: false,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPropertyById({
  id,
  userId,
}: {
  id: string;
  userId?: string;
}) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );

    if (userId) {
      const wishlistResult = await databases.listDocuments(
        config.databaseId!,
        config.whislistCollectionId!,
        [Query.equal("userId", userId), Query.equal("$id", id)]
      );
      return {
        ...result,
        isInWishlist: wishlistResult.documents.length > 0,
      };
    }

    return { ...result, isInWishlist: false };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getLatestProperties({ userId }: { userId: string }) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );

    const properties = result.documents;

    if (userId) {
      console.log(userId);
      const wishlistResult = await databases.listDocuments(
        config.databaseId!,
        config.whislistCollectionId!,
        [Query.equal("userId", userId)]
      );
      const wishlistPropertyIds = new Set(
        wishlistResult.documents.map((doc) => doc.propertyId.$id)
      );
      console.log("8888888888888888888888888888888888888888888");
      console.log(wishlistPropertyIds);
      console.log("8888888888888888888888888888888888888888888");

      return properties.map((property) => ({
        ...property,
        isInWishlist: wishlistPropertyIds.has(property.$id),
      }));
    }

    return properties.map((property) => ({
      ...property,
      isInWishlist: false,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMinMaxPrice() {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.select(["price"])] // Only fetch the price field
    );

    const prices = response.documents.map((doc) => doc.price);

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  } catch (error) {
    console.error("Error fetching min/max price:", error);
    return { minPrice: null, maxPrice: null };
  }
}
export async function getMinMaxSize() {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.select(["price"])] // Only fetch the price field
    );

    const prices = response.documents.map((doc) => doc.price);

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  } catch (error) {
    console.error("Error fetching min/max price:", error);
    return { minPrice: null, maxPrice: null };
  }
}

// Function to create a review and update the property's rating
export const createReviewAndUpdateProperty = async (
  name: string,
  avatar: string,
  review: string,
  rating: number,
  propertyId: string
) => {
  try {
    // Step 1: Create the review
    const newReview = await databases.createDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      ID.unique(),
      {
        name,
        avatar,
        review,
        rating,
        property: propertyId,
      }
    );

    console.log("Review Created:", newReview);

    // Step 2: Fetch all reviews for the given property
    const reviews = await databases.listDocuments(
      config.databaseId!,
      config.reviewsCollectionId!,
      [Query.equal("property", propertyId)]
    );

    const totalReviews = reviews.total;
    const totalRating = reviews.documents.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      totalReviews > 0 ? totalRating / totalReviews : rating;

    // Step 3: Update the property's rating
    const updatedProperty = await databases.updateDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      propertyId,
      {
        rating: averageRating,
        // reviewCount: totalReviews, // Optional field to store total reviews
      }
    );

    console.log("Property Updated:", updatedProperty);

    return { newReview, updatedProperty };
  } catch (error) {
    console.error("Error creating review or updating property:", error);
    throw error;
  }
};

export const toggleWishlist = async (userId: string, propertyId: string) => {
  try {
    // Fetch all wishlist entries for the user
    const response = await databases.listDocuments(
      config.databaseId!,
      config.whislistCollectionId!,
      [Query.equal("userId", userId)]
    );

    // Manually check if the property is already in the wishlist
    const wishlistItem = response.documents.find(
      (doc) => doc.propertyId === propertyId // Ensure direct comparison
    );

    if (wishlistItem) {
      // Remove from wishlist
      await databases.deleteDocument(
        config.databaseId!,
        config.whislistCollectionId!,
        wishlistItem.$id
      );
      return { success: true, message: "Removed from wishlist" };
    } else {
      // Add property to wishlist
      await databases.createDocument(
        config.databaseId!,
        config.whislistCollectionId!,
        ID.unique(),
        {
          userId,
          propertyId, // Ensure it's stored as a single string ID
        }
      );
      return { success: true, message: "Added to wishlist" };
    }
  } catch (error: any) {
    console.error("Error toggling wishlist:", error.message || error);
    return { success: false, message: "Failed to toggle wishlist" };
  }
};

export const getWishlistForUser = async ({ userId }: { userId: string }) => {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.whislistCollectionId!,
      [Query.equal("userId", userId)] 
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};
