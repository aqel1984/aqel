import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AppleBusinessChat from '@/components/AppleBusinessChat';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Cosmetics Manufacturer',
    company: 'Natural Beauty Co.',
    content: 'The quality of Aqel Jehad\'s shea butter is exceptional. Their commitment to ethical sourcing and consistent quality has made them our primary supplier.',
    image: '/images/testimonial-1.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Supply Chain Director',
    company: 'Global Foods Ltd',
    content: 'Their bulk ordering process is seamless, and the cocoa butter quality is outstanding. The Apple Business Chat support makes communication effortless.',
    image: '/images/testimonial-2.jpg',
  },
  {
    name: 'Emma Williams',
    role: 'Founder',
    company: 'Organic Skincare',
    content: 'We\'ve been using their raw shea butter for our premium skincare line. The purity and consistency of their products are unmatched in the industry.',
    image: '/images/testimonial-3.jpg',
  },
];

const stats = [
  { label: 'Years of Experience', value: '15+' },
  { label: 'Countries Served', value: '50+' },
  { label: 'Satisfied Customers', value: '1000+' },
  { label: 'Tonnes Delivered', value: '10,000+' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center">
        <Image
          src="/images/hero-shea.jpg"
          alt="Pure African Shea Butter"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Pure West African<br />
            <span className="text-yellow-400">Shea & Cocoa Butter</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Direct from the heart of West Africa, we bring you nature's finest moisturizers. 
            Premium quality, ethically sourced, and authentically crafted.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <AppleBusinessChat 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Premium Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Shea Butter Card */}
            <div className="bg-neutral-50 rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/raw-shea.jpg"
                  alt="Raw Shea Butter"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Raw Shea Butter</h3>
                <p className="text-gray-600 mb-4">
                  100% pure, unrefined shea butter from Ghana. Rich in vitamins A, E, and F.
                </p>
                <Link href="/products/shea-butter" className="text-primary hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Cocoa Butter Card */}
            <div className="bg-neutral-50 rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/cocoa-butter.jpg"
                  alt="Cocoa Butter"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Cocoa Butter</h3>
                <p className="text-gray-600 mb-4">
                  Premium cocoa butter, perfect for skincare and culinary applications.
                </p>
                <Link href="/products/cocoa-butter" className="text-primary hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>

            {/* Bulk Orders Card */}
            <div className="bg-neutral-50 rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/images/bulk-orders.jpg"
                  alt="Bulk Orders"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Bulk Orders</h3>
                <p className="text-gray-600 mb-4">
                  Large quantities available for businesses. Custom packaging options.
                </p>
                <Link href="/bulk-orders" className="text-primary hover:underline">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-natural-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-16">
            From West Africa to Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Ethical Sourcing</h3>
              <p className="text-natural-600">
                We work directly with local communities in West Africa, ensuring fair compensation
                and sustainable practices.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality Processing</h3>
              <p className="text-natural-600">
                Traditional methods combined with modern quality control ensure the highest
                grade products.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Distribution</h3>
              <p className="text-natural-600">
                Efficient logistics and worldwide shipping ensure your products arrive on time,
                every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-neutral-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-natural-600">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-natural-700">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-natural-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">Our Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/images/cert-organic.png"
                  alt="Organic Certified"
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-semibold">Organic Certified</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/images/cert-fairtrade.png"
                  alt="Fair Trade"
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-semibold">Fair Trade</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/images/cert-usda.png"
                  alt="USDA Certified"
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-semibold">USDA Certified</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/images/cert-iso.png"
                  alt="ISO 9001"
                  width={60}
                  height={60}
                />
              </div>
              <h3 className="font-semibold">ISO 9001</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/icons/quality.svg"
                  alt="Quality"
                  width={32}
                  height={32}
                />
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">100% pure, unrefined, and natural products</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/icons/ethical.svg"
                  alt="Ethical"
                  width={32}
                  height={32}
                />
              </div>
              <h3 className="font-semibold mb-2">Ethically Sourced</h3>
              <p className="text-gray-600">Supporting local West African communities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/icons/shipping.svg"
                  alt="Shipping"
                  width={32}
                  height={32}
                />
              </div>
              <h3 className="font-semibold mb-2">Global Shipping</h3>
              <p className="text-gray-600">Fast and reliable worldwide delivery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/icons/support.svg"
                  alt="Support"
                  width={32}
                  height={32}
                />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">24/7 customer service via Apple Business Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Nature's Best?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our premium West African products
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">View Products</Link>
            </Button>
            <AppleBusinessChat 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
            />
          </div>
        </div>
      </section>
    </main>
  );
}