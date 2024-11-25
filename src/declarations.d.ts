declare module '@/app/api/hello/route' {
  import { NextApiRequest, NextApiResponse } from 'next';
  const handler: (req: NextApiRequest, res: NextApiResponse) => void;
  export default handler;
}