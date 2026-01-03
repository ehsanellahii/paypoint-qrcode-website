'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-100 rounded-lg py-8 p-2 lg:-mb-10 m-4 lg:ml-42 lg:mr-4 text-sm">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start pb-4 mb-4 border-b border-gray-300">
          {/* Business Name - Left */}
          <div className="font-bold text-gray-800 mb-2 md:mb-0">
            Fat Phills The Mall
          </div>
          
          {/* Contact Information - Right */}
          <div className="text-gray-700 text-center md:text-right">
            Email: Mall@fatphillsdiner.com CoC: 80544118 VAT: NL861709421B01
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          {/* Logo + Brand - Left */}
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <span 
              className="inline-flex items-center justify-center rounded-full bg-black h-12 w-12"
              aria-label="Fat Phills The Mall Logo"
            />
            <span className="font-bold text-black">onesix</span>
          </div>

          {/* Legal Links + Copyright - Right */}
          <div className="text-gray-700 text-center md:text-right">
            <a href="https://byonesix.com/t-c-privacy-statement" className="hover:underline mr-4">
              Terms and conditions
            </a>
            <a href="https://byonesix.com/t-c-privacy-statement" className="hover:underline mr-4">
              Privacy policy
            </a>
            <span>© onesix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

