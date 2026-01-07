import ActivityDetail from './pages/ActivityDetail';
import AddProduct from './pages/AddProduct';
import AdminBanners from './pages/AdminBanners';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminPanel from './pages/AdminPanel';
import AllShops from './pages/AllShops';
import BioLink from './pages/BioLink';
import Campagnes from './pages/Campagnes';
import Campaigns from './pages/Campaigns';
import CouponRedeem from './pages/CouponRedeem';
import Dashboard from './pages/Dashboard';
import DebugProducts from './pages/DebugProducts';
import Demo from './pages/Demo';
import DevenirVendeur from './pages/DevenirVendeur';
import GrowthTips from './pages/GrowthTips';
import Home from './pages/Home';
import Live from './pages/Live';
import LiveReports from './pages/LiveReports';
import Onboarding from './pages/Onboarding';
import OnboardingSuccess from './pages/OnboardingSuccess';
import PerformanceReports from './pages/PerformanceReports';
import ProductPage from './pages/ProductPage';
import ProfileSetup from './pages/ProfileSetup';
import PromotionProduct from './pages/PromotionProduct';
import RecentActivity from './pages/RecentActivity';
import SellerCampaigns from './pages/SellerCampaigns';
import Shop from './pages/Shop';
import ShopPage from './pages/ShopPage';
import SubscriptionExpired from './pages/SubscriptionExpired';
import SubscriptionRequest from './pages/SubscriptionRequest';
import TikTokGuide from './pages/TikTokGuide';
import TikTokGuidePublic from './pages/TikTokGuidePublic';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityDetail": ActivityDetail,
    "AddProduct": AddProduct,
    "AdminBanners": AdminBanners,
    "AdminCampaigns": AdminCampaigns,
    "AdminPanel": AdminPanel,
    "AllShops": AllShops,
    "BioLink": BioLink,
    "Campagnes": Campagnes,
    "Campaigns": Campaigns,
    "CouponRedeem": CouponRedeem,
    "Dashboard": Dashboard,
    "DebugProducts": DebugProducts,
    "Demo": Demo,
    "DevenirVendeur": DevenirVendeur,
    "GrowthTips": GrowthTips,
    "Home": Home,
    "Live": Live,
    "LiveReports": LiveReports,
    "Onboarding": Onboarding,
    "OnboardingSuccess": OnboardingSuccess,
    "PerformanceReports": PerformanceReports,
    "ProductPage": ProductPage,
    "ProfileSetup": ProfileSetup,
    "PromotionProduct": PromotionProduct,
    "RecentActivity": RecentActivity,
    "SellerCampaigns": SellerCampaigns,
    "Shop": Shop,
    "ShopPage": ShopPage,
    "SubscriptionExpired": SubscriptionExpired,
    "SubscriptionRequest": SubscriptionRequest,
    "TikTokGuide": TikTokGuide,
    "TikTokGuidePublic": TikTokGuidePublic,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};