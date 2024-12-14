// components/Footer.jsx
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-6"
      style={{ marginLeft: '-400px', marginRight: '-400px' }} // Extend background
      >
        <div className="container mx-auto text-center">
          <p className="mb-4">
            <a href="/terms" className="text-blue-400 hover:underline"> {/* Link: Terms of Service */}
              Terms of Service
            </a>{' '}
            |{' '}
            <a href="/privacy" className="text-blue-400 hover:underline"> {/* Link: Privacy Policy */}
              Privacy Policy
            </a>{' '}
            |{' '}
            <a href="/contact" className="text-blue-400 hover:underline"> {/* Link: Contact Us */}
              Contact Us
            </a>
          </p>
          <p>&copy; 2024 Melodi. All rights reserved.</p> {/* Copyright */}
        </div>
      </footer>
    );
  }
  