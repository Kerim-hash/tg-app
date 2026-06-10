'use client'

import dynamic from 'next/dynamic';

const MyTWAComponent = dynamic(() => import('../components/mtTg'), { ssr: false });

function Page() {
  return (
    <div id="app-wrapper">
      <MyTWAComponent />
    </div>
  );
}

export default Page;