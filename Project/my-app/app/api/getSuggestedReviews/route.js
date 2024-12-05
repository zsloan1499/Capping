import { connectMongoDB } from '/lib/mongodb';
import { User, Review, Song } from "/models/User";
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    await connectMongoDB();

    const { genres } = await req.json();

    if (!genres || genres.length === 0) {
      return NextResponse.json({ error: 'A valid genres array is required.' }, { status: 400 });
    }

    console.log('Received genres:', genres); // Add logging

    const flatGenres = genres.flat().map((genre) => genre.toLowerCase().trim());
    const uniqueGenres = [...new Set(flatGenres)];

    const songs = await Song.find({
      genres: { $in: uniqueGenres },
    })
      .select('_id name artist genres')
      .limit(20);

    console.log('Found songs:', songs); // Add logging to verify songs found

    if (!songs || songs.length === 0) {
      return NextResponse.json({ error: 'No songs found matching the provided genres.' }, { status: 404 });
    }

    const songIds = songs.map(song => song._id);

    const reviews = await Review.find({
      'song': { $in: songIds },
    })
      .populate('song', 'name artist genres')
      .populate('user', 'username')
      .select('_id reviewText rating song user likes createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('Found reviews:', reviews); // Add logging to verify reviews found

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ error: 'No reviews found for the matching songs.' }, { status: 404 });
    }

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      reviewText: review.reviewText,
      rating: review.rating,
      songName: review.song?.name || 'Unknown',
      songArtist: review.song?.artist || 'Unknown',
      songGenres: review.song?.genres || [],
      username: review.user?.username || 'Anonymous',
      likes: review.likes || 0,
      createdAt: review.createdAt,
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching suggested reviews:', error);
    return NextResponse.json({ error: 'An error occurred while fetching reviews.' }, { status: 500 });
  }
}
