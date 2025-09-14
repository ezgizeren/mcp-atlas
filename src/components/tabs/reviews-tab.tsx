import React, { useState } from 'react';
import { Review } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  User,
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: Review[];
  serverId: string;
}

export function ReviewsTab({ reviews, serverId }: ReviewsTabProps) {
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = () => {
    // Handle review submission
    console.log('Submit review:', { rating, reviewTitle, reviewContent });
    setRating(0);
    setReviewTitle('');
    setReviewContent('');
  };

  const StarRating = ({ value, onChange, onHover }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={() => onHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hoveredStar || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews Summary</CardTitle>
          <CardDescription>
            Community feedback and ratings for this server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-3">{stars}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>
            Share your experience with this server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="mt-2">
              <StarRating
                value={rating}
                onChange={setRating}
                onHover={setHoveredStar}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="review-title">Title</Label>
            <input
              id="review-title"
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              placeholder="Summarize your experience"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="review-content">Review</Label>
            <Textarea
              id="review-content"
              placeholder="Tell others about your experience with this server..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={!rating || !reviewTitle || !reviewContent}
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  {review.userAvatar ? (
                    <img src={review.userAvatar} alt={review.userName} />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-muted-foreground">{review.content}</p>

                  <div className="flex items-center gap-4 pt-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No reviews yet. Be the first to review this server!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}