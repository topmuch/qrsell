import AddProduct from './pages/AddProduct';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import TikTokGuide from './pages/TikTokGuide';


export const PAGES = {
    "AddProduct": AddProduct,
    "Dashboard": Dashboard,
    "Demo": Demo,
    "Home": Home,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "TikTokGuide": TikTokGuide,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};