import AddProduct from './pages/AddProduct';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import TikTokGuide from './pages/TikTokGuide';
import Demo from './pages/Demo';


export const PAGES = {
    "AddProduct": AddProduct,
    "Dashboard": Dashboard,
    "Home": Home,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "TikTokGuide": TikTokGuide,
    "Demo": Demo,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};