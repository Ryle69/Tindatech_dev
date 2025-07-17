'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: number
  rating: number
  review: string | null
  created_at: string
  user_id: string | null
  Users?: {
    first_name: string
    last_name: string
  } | null
}

export function ReviewsList({ productId }: { productId: number }) {
  const supabase = createClientComponentClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('ReviewsList component rendered with productId:', productId)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // First get all order items for this product
        const { data: orderItems, error: orderItemsError } = await supabase
            .from('OrderItems')
            .select('order_id')
            .eq('product_id', productId)

        if (orderItemsError) throw orderItemsError

        if (!orderItems || orderItems.length === 0) {
          setReviews([])
          setLoading(false)
          return
        }

        const orderIds = orderItems.map(item => item.order_id)

        // Get reviews first
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('Reviews')
            .select('id, rating, review, created_at, user_id')
            .in('order_id', orderIds)
            .order('created_at', { ascending: false })

        if (reviewsError) throw reviewsError

        // Then get user info for each review
        const reviewsWithUsers = await Promise.all(
            (reviewsData || []).map(async (review) => {
              if (review.user_id) {
                const { data: userData } = await supabase
                    .from('Users')
                    .select('first_name, last_name')
                    .eq('auth_id', review.user_id)
                    .single()

                return {
                  ...review,
                  Users: userData || undefined
                }
              }
              return {
                ...review,
                Users: undefined
              }
            })
        )

        if (reviewsError) throw reviewsError

        setReviews(reviewsWithUsers || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId, supabase])

  if (loading) {
    return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          <span className="ml-2">Loading reviews...</span>
        </div>
    )
  }

  if (error) {
    return (
        <div className="text-center py-8 text-red-500">
          Failed to load reviews: {error}
        </div>
    )
  }

  if (reviews.length === 0) {
    return (
        <div className="text-center py-8 text-gray-500">
          No reviews found for this product.
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {review.Users?.first_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">
                    {review.Users ? `${review.Users.first_name} ${review.Users.last_name}` : 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                  </div>
                </div>
              </div>
              {review.review && (
                  <p className="text-gray-700 pl-14">{review.review}</p>
              )}
            </div>
        ))}
      </div>
  )
}