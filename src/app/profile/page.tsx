'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import Loading from '../loading';
import { Card, CardContent } from '@/components/ui/card';
import { GeneratePhotoReviewOutput } from '@/ai/flows/generate-photo-review';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Image from 'next/image';


type PhotoReview = {
  id: string;
  reviewText: string;
  createdAt: Timestamp;
  photoUrl: string;
};

const ReviewSection = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h3 className="font-bold">{title}</h3>
    <p>{content}</p>
  </div>
);


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const reviewsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/photoReviews`),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: reviews, isLoading: reviewsLoading } = useCollection<PhotoReview>(reviewsQuery);

  if (isUserLoading || reviewsLoading) {
    return <Loading />;
  }

  if (!user) {
    router.replace('/login');
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-headline">Your Saved Reviews</h1>
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => {
              const parsedReview: GeneratePhotoReviewOutput = JSON.parse(review.reviewText);
              const createdAtDate = review.createdAt.toDate();
              
              return (
                <Card key={review.id} className="overflow-hidden shadow-lg flex flex-col">
                  {review.photoUrl && (
                     <div className="relative aspect-square w-full">
                       <Image 
                         src={review.photoUrl}
                         alt="Reviewed photo"
                         fill
                         className="object-cover"
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                       />
                     </div>
                  )}
                  <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="space-y-4 leading-relaxed text-foreground/90 text-sm flex-grow">
                        <ReviewSection title="Overall" content={parsedReview.overall} />
                        <ReviewSection title="Lighting" content={parsedReview.lighting} />
                        <ReviewSection title="Colors" content={parsedReview.colors} />
                        <ReviewSection title="Perspective" content={parsedReview.perspective} />
                        <ReviewSection title="Composition" content={parsedReview.composition} />
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">Rating:</h3>
                          <div className="flex">
                            {[...Array(10)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < parsedReview.rating
                                    ? 'text-primary fill-primary'
                                    : 'text-muted-foreground/50'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold">{parsedReview.rating}/10</span>
                        </div>
                      </div>
                       <p className="text-xs text-muted-foreground pt-4 mt-auto">
                        Saved {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                      </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No reviews saved yet.</h2>
            <p className="text-muted-foreground mt-2">
              Go to the main page to upload a photo and save your first review!
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Get a review
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
