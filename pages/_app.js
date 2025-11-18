import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from "@/components/ui/Navbar";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp
