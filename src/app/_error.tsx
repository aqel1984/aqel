import React from 'react'
import Link from 'next/link'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

interface ErrorProps {
  statusCode: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Head>
        <title>Error {statusCode} | Aqel Jehad LTD</title>
        <meta name="description" content={`Error ${statusCode} occurred`} />
      </Head>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">Error {statusCode}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-center text-muted-foreground mb-8">
            {statusCode
              ? `An error ${statusCode} occurred on the server`
              : 'An error occurred on the client'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">
              Go back home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode: statusCode || 500 }
}

export default Error