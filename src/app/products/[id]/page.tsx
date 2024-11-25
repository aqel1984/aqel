import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProductById } from '@/lib/api'

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              Origin: {product.origin} | Grade: {product.grade}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Image 
                  src={`/products/${product.id}.jpg`}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="rounded-lg object-cover w-full"
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>1kg Price:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(product.price_1kg)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>100kg Price:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(product.price_100kg)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>20ft Container:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(product.price_20ft)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>40ft Container:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(product.price_40ft)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Stock Available: {product.stock_quantity}kg</p>
                    <p>Harvest Date: {new Date(product.harvested_date).toLocaleDateString()}</p>
                    <p>Grade: {product.grade}</p>
                    <p>Origin: {product.origin}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline">Contact Sales</Button>
            <Button>Request Quote</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}