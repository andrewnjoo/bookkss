import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { Button, Tooltip } from '@mui/material';
import { Share } from '@mui/icons-material';

import { SERVER_URL } from '../lib/helpers';

export function PublicReview() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);

  const handleCopy = () => {
    const url = `${window.location.origin}/review/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(`Copied link to ${review.title} to clipboard!`);
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
      });
  };

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/reviews/get-public-review/${id}`)
      .then((response) => {
        setReview(response.data[0]);
      })
      .catch((error) => {
        console.error('Error fetching review:', error);
      });
  }, [id]);

  return (
    <div className='mx-6 mb-48 mt-12 flex items-center justify-center rounded border p-4 lg:mx-64'>
      {review ? (
        <div>
          <h2 className='text-xl font-semibold'>{review.title}</h2>
          <p className='my-2 mb-4 flex items-center text-gray-600'>
            Posted on {new Date(review.createdAt).toLocaleDateString()}
            <Tooltip title='Copy link to review' arrow sx={{ ml: 2 }}>
              <Button onClick={handleCopy} color='inherit'>
                <Share />
              </Button>
            </Tooltip>
          </p>
          <Link to={`/profile/${review.userId}`}>
            <p className='mb-4 cursor-pointer text-xl text-gray-600 hover:text-blue-500'>
              More reviews by user: {review.userId}
            </p>
          </Link>
          <MDEditor.Markdown
            source={review.body}
            wrapperElement={{ 'data-color-mode': 'light' } as any}
          />
        </div>
      ) : (
        <p>Loading review...</p>
      )}
      <ToastContainer position='bottom-left' autoClose={2000} />
    </div>
  );
}
