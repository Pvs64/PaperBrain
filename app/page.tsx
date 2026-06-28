import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import {sampleBooks} from "@/lib/constants";

const page = () => {
  return (
    <main className="wrapper containers">
      <HeroSection />

      <div className="library-books-grid">
        {sampleBooks.map((book) =>(
          <BookCard
            key={book.slug}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  )
}

export default page