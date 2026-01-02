import AddProduct from './pages/AddProduct';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import TikTokGuide from './pages/TikTokGuide';
import AdminBanners from './pages/AdminBanners';


export const PAGES = {
    "AddProduct": AddProduct,
    "AdminPanel": AdminPanel,
    "Dashboard": Dashboard,
    "Demo": Demo,
    "Home": Home,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "TikTokGuide": TikTokGuide,
    "AdminBanners": AdminBanners,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};