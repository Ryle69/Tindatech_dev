"use client"

import { Suspense } from "react"
import CheckoutSuccessPage from "./CheckoutSuccessPage"

export default function CheckoutSuccessPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutSuccessPage />
        </Suspense>
    )
}
