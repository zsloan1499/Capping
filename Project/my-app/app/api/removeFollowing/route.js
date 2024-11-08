import { getSession } from "next-auth/react";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { followingId, userId } = req.body;

        // Check if both followingId and userId are provided
        if (!followingId || !userId) {
            console.error("Invalid request data:", { followingId, userId });
            return res.status(400).json({ error: "Invalid request data" });
        }

        try {
            await client.connect();
            const db = client.db("your-database-name");
            const usersCollection = db.collection("users");

            // Remove following from the user's following list
            const updateUser = await usersCollection.updateOne(
                { _id: userId },
                { $pull: { following: followingId } }
            );

            // Remove the user from the following's followers list
            const updateFollowing = await usersCollection.updateOne(
                { _id: followingId },
                { $pull: { followers: userId } }
            );

            if (updateUser.modifiedCount > 0 && updateFollowing.modifiedCount > 0) {
                return res.status(200).json({ success: true });
            } else {
                console.error("Failed to remove following:", { updateUser, updateFollowing });
                return res.status(400).json({ error: "Failed to remove following." });
            }
        } catch (error) {
            console.error("Error removing following:", error);
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}

