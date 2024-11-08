import { getSession } from "next-auth/react";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { followerId, userId } = req.body;

        // Check if both followerId and userId are provided
        if (!followerId || !userId) {
            console.error("Invalid request data:", { followerId, userId });
            return res.status(400).json({ error: "Invalid request data" });
        }

        try {
            await client.connect();
            const db = client.db("your-database-name");
            const usersCollection = db.collection("users");

            // Remove follower from the user's followers list
            const updateUser = await usersCollection.updateOne(
                { _id: userId },
                { $pull: { followers: followerId } }
            );

            // Remove the user from the follower's following list
            const updateFollower = await usersCollection.updateOne(
                { _id: followerId },
                { $pull: { following: userId } }
            );

            if (updateUser.modifiedCount > 0 && updateFollower.modifiedCount > 0) {
                return res.status(200).json({ success: true });
            } else {
                console.error("Failed to remove follower:", { updateUser, updateFollower });
                return res.status(400).json({ error: "Failed to remove follower." });
            }
        } catch (error) {
            console.error("Error removing follower:", error);
            return res.status(500).json({ error: "Internal server error" });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
