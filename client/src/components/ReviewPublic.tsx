import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { ExpandMore, ExpandLess, Unarchive } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { Review } from './ReviewComponent';
import { saveReview } from '../lib/helpers';

export interface ReviewPublicProps {
  review: Review;
  archive?: boolean;
  getReviews?: () => void;
  noExpand?: boolean;
}

export const ReviewPublic = ({
  review,
  archive = false,
  getReviews = () => {},
  noExpand = false,
}: ReviewPublicProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleUnarchive = async () => {
    await saveReview({
      userId: review.userId,
      reviewId: review.id,
      title: review.title,
      updatedBody: review.body,
      setPrivate: review.private,
      setArchive: false,
      reviewDate: review.reviewDate,
    });
    getReviews();
  };

  // console.log('reviewPublic', review);

  return (
    <div
      key={review.id}
      className='mb-4 w-full max-w-[1000px] rounded border p-4'
    >
      <div className='flex items-center justify-between'>
        <span>
          <Link to={`/review/${review.id}`}>
            <h3 className='cursor-pointer text-xl font-bold'>
              {review.title} {dayjs(review.reviewDate).format('YYYY-MM-DD')}
            </h3>
          </Link>
          <Link to={`/profile/${review.userId}`}>
            <p>by user: {review.userId}</p>
          </Link>
        </span>
        <div className='flex flex-row items-center gap-4'>
          {archive && (
            <Tooltip title='Unarchive' color='inherit' arrow>
              <Button onClick={handleUnarchive} variant='text'>
                <Unarchive />
              </Button>
            </Tooltip>
          )}
          {!noExpand && (
            <Tooltip
              title={expanded ? 'Collapse' : 'Expand'}
              color='inherit'
              arrow
            >
              <Button
                onClick={() => setExpanded(!expanded)}
                variant='text'
                color='inherit'
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      <MDEditor.Markdown
        className='max-w-[1000px] overflow-hidden'
        source={
          expanded ? review.body : review.body.slice(0, 50).replace(/\n/g, ' ')
        }
        wrapperElement={{ 'data-color-mode': 'light' } as any}
      />
    </div>
  );
};
