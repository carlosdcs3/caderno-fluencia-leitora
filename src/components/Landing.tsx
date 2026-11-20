import Footer from './Footer';
import SalesLanding from './SalesLanding';
import type {ProductConfig} from '@/lib/db';
import {readiness} from '@/lib/config';
export default function Landing({product}:{product:ProductConfig}){
 return <><SalesLanding product={product} salesEnabled={readiness().ready}/><Footer/></>;
}
