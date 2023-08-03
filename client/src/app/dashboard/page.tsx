'use client';

import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

interface Review {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface EditModeState {
  [reviewId: string]: boolean;
}

const ServerProtectedPage = () => {
  const { data: session }: { data: any } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editMode, setEditMode] = useState<EditModeState>({});
  const [showAddReview, setShowAddReview] = useState(false);

  // console.log('session', session);

  const getReviews = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/get-user-reviews?userId=${session?.user?.id}`
    );
    // console.log(res.data);
    setReviews(res.data);
  };

  useEffect(() => {
    if (session) getReviews();
  }, [session]);

  const onAddReview = () => {
    axios
      .post(`${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/upsert-review`, {
        title,
        body,
        userId: session?.user?.id,
      })
      .then(() => {
        getReviews();
        setTitle('');
        setBody('');
      });
  };

  const onDelete = (id: string) => {
    window.confirm('Are you sure you want to delete this review?') &&
      axios
        .delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/delete-review`, {
          data: {
            id,
            userId: session?.user?.id,
          },
        })
        .then(() => getReviews());
  };

  const toggleEditMode = (reviewId: string) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [reviewId]: !prevEditMode[reviewId],
    }));
  };

  const onSaveReview = (reviewId: string, updatedBody: string) => {
    axios
      .post(`${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/upsert-review`, {
        id: reviewId,
        title: reviews.find((review) => review.id === reviewId)?.title, // Keep the existing title
        body: updatedBody,
        userId: session?.user?.id,
      })
      .then(() => {
        getReviews();
        setEditMode((prevEditMode) => ({
          ...prevEditMode,
          [reviewId]: false, // Turn off edit mode after saving
        }));
      });
  };

  return (
    <section className='py-24'>
      <div className='container mx-auto flex flex-col px-4'>
        <h1 className='text-2xl font-bold'>Welcome to your dashboard</h1>
        <h2 className='mt-4 font-medium'>
          You are logged in as: {session?.user?.name}
        </h2>
        <button
          className='mt-4 w-[120px] rounded bg-blue-500 p-2 text-white'
          onClick={() => setShowAddReview((prev) => !prev)}
        >
          {showAddReview ? 'Hide Add Review' : 'Add Review'}
        </button>

        {showAddReview && (
          <div className='mt-4 flex flex-col rounded-xl border p-4'>
            <div className='mb-2 underline'>Add review</div>
            <div>
              <div className='mb-2'>Title</div>
              <input
                className='w-full border p-4'
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
            <div>
              <div className='mb-2'>Body</div>
              <textarea
                className='w-full border p-6'
                onChange={(e) => setBody(e.target.value)}
                value={body}
              />
            </div>
            <div className='flex gap-2'>
              <button
                className='mt-4 w-[100px] rounded bg-gray-500 p-2 text-white'
                onClick={onAddReview}
              >
                Add review
              </button>
              <button
                className='mt-4 w-[100px] rounded bg-gray-700 p-2 text-white'
                onClick={() => {
                  setTitle('');
                  setBody('');
                }}
              >
                Clear content
              </button>
            </div>
          </div>
        )}
        <div className='mt-4'>
          <div className='mb-2'>Reviews</div>
          {reviews.map((review: any) => (
            <div key={review.id} className='mb-4 rounded border p-4'>
              <h3 className='text-xl font-bold'>
                {review.title} {new Date(review.createdAt).toLocaleDateString()}
              </h3>
              <div className='flex gap-2'>
                {editMode[review.id] ? (
                  <>
                    <button
                      className='rounded bg-indigo-500 px-2 py-1 text-white'
                      onClick={() => onSaveReview(review.id, review.body)}
                    >
                      Save
                    </button>
                    <button
                      className='rounded bg-gray-500 px-2 py-1 text-white'
                      onClick={() => {
                        // Cancel edit mode and reset the review body to its original value
                        setEditMode((prevEditMode) => ({
                          ...prevEditMode,
                          [review.id]: false,
                        }));
                        setReviews((prevReviews) =>
                          prevReviews.map((prevReview) =>
                            prevReview.id === review.id
                              ? { ...prevReview, body: review.body }
                              : prevReview
                          )
                        );
                      }}
                    >
                      Cancel Edit
                    </button>
                  </>
                ) : (
                  <button
                    className='rounded bg-blue-500 px-2 py-1 text-white'
                    onClick={() => toggleEditMode(review.id)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className='rounded bg-red-500 px-2 py-1 text-white'
                  onClick={() => onDelete(review.id)}
                >
                  Delete
                </button>
              </div>
              {editMode[review.id] ? (
                <MDEditor
                  value={review.body}
                  onChange={(updatedBody) => {
                    // Real-time update of the Markdown content while editing
                    setReviews((prevReviews: any) =>
                      prevReviews.map((prevReview: Review) =>
                        prevReview.id === review.id
                          ? { ...prevReview, body: updatedBody }
                          : prevReview
                      )
                    );
                  }}
                  previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                  }}
                />
              ) : (
                <MDEditor.Markdown
                  source={review.body}
                  wrapperElement={{ 'data-color-mode': 'light' } as any}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServerProtectedPage;
