import { useEffect, useState } from 'react';
import ColumnChart from '@/components/widgets/column-chart';
import StickerCard from '@/components/widgets/sticker-card';
// import {
//   useAnalyticsQuery,
//   useProductByCategoryQuery,
//   useTopRatedProductsQuery,
// } from '@/data/dashboard';
import {
  adminOnly,
  adminAndOwnerOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import usePrice from '@/utils/use-price';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import { BasketIcon } from '@/components/icons/summary/basket';
import Button from '@/components/ui/button';
import { motion } from 'framer-motion';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useOwnerDashboardQuery } from '@/graphql/owner-dashboard-query.graphql';
import PageHeading from '@/components/common/page-heading';

const ShopList = dynamic(() => import('@/components/dashboard/shops/shops'));
const OrderStatusWidget = dynamic(
  () => import('@/components/dashboard/widgets/box/widget-order-by-status')
);
const ProductCountByCategory = dynamic(
  () =>
    import(
      '@/components/dashboard/widgets/table/widget-product-count-by-category'
    )
);

const TopRatedProducts = dynamic(
  () => import('@/components/dashboard/widgets/box/widget-top-rate-product')
);

const OwnerShopLayout = () => {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { permissions } = getAuthCredentials();
  const [activeTimeFrame, setActiveTimeFrame] = useState(1);

  const { data, loading, error } = useOwnerDashboardQuery({
    variables: {
      limit: 10,
      language: locale,
    },
  });

  const [orderDataRange, setOrderDataRange] = useState(
    data?.analytics?.todayTotalOrderByStatus
  );

  const { price: total_revenue } = usePrice(
    data && {
      amount: Number(data?.analytics?.totalRevenue),
    }
  );

  const { price: total_refund } = usePrice(
    data && {
      amount: Number(data?.analytics?.totalRefunds),
    }
  );

  const { price: todays_revenue } = usePrice(
    data && {
      amount: Number(data?.analytics?.todaysRevenue),
    }
  );

  const timeFrame = [
    { name: 'Today', day: 1 },
    { name: 'Weekly', day: 7 },
    { name: 'Monthly', day: 30 },
    { name: 'Yearly', day: 365 },
  ];

  useEffect(() => {
    switch (activeTimeFrame) {
      case 1:
        setOrderDataRange(data?.analytics?.todayTotalOrderByStatus);
        break;
      case 7:
        setOrderDataRange(data?.analytics?.weeklyTotalOrderByStatus);
        break;
      case 30:
        setOrderDataRange(data?.analytics?.monthlyTotalOrderByStatus);
        break;
      case 365:
        setOrderDataRange(data?.analytics?.yearlyTotalOrderByStatus);
        break;

      default:
        setOrderDataRange(orderDataRange);
        break;
    }
  });

  if (loading) {
    return <Loader text={t('common:text-loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error?.message} />;
  }

  let salesByYear: number[] = Array.from({ length: 12 }, (_) => 0);
  if (!!data?.analytics?.totalYearSaleByMonth?.length) {
    salesByYear = data.analytics.totalYearSaleByMonth.map((item: any) =>
      item.total.toFixed(2)
    );
  }

  return (
    <>
      <div className="mb-8 rounded-lg bg-light p-5 md:p-8">
        <div className="mb-7 flex items-center justify-between">
          <PageHeading title={t('text-summary')} />
        </div>
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StickerCard
            titleTransKey="sticker-card-title-rev"
            // subtitleTransKey="sticker-card-subtitle-rev"
            icon={<EaringIcon className="h-8 w-8" />}
            color="#047857"
            price={total_revenue}
          />
          <StickerCard
            titleTransKey="sticker-card-title-today-refunds"
            // subtitleTransKey="sticker-card-subtitle-order"
            icon={<ShoppingIcon className="h-8 w-8" />}
            color="#865DFF"
            price={total_refund}
          />
          <StickerCard
            titleTransKey="sticker-card-title-total-shops"
            icon={<BasketIcon className="h-8 w-8" />}
            color="#E157A0"
            price={data?.analytics?.totalShops}
          />
          <StickerCard
            titleTransKey="sticker-card-title-today-rev"
            icon={<ChecklistIcon className="h-8 w-8" />}
            color="#D74EFF"
            price={todays_revenue}
          />
        </div>
      </div>
      <div className="mb-8 rounded-lg bg-light p-5 md:p-8">
        <div className="mb-5 items-center justify-between sm:flex md:mb-7">
          <PageHeading title={t('text-order-status')} />
          <div className="mt-3.5 inline-flex rounded-full bg-gray-100/80 p-1.5 sm:mt-0">
            {timeFrame
              ? timeFrame?.map((time) => (
                  <div key={time.day} className="relative">
                    <Button
                      className={cn(
                        '!focus:ring-0  relative z-10 !h-7 rounded-full !px-2.5 text-sm font-medium text-gray-500',
                        time?.day === activeTimeFrame ? 'text-accent' : ''
                      )}
                      type="button"
                      onClick={() => setActiveTimeFrame(time?.day)}
                      variant="custom"
                    >
                      {time?.name}
                    </Button>
                    {time.day === activeTimeFrame ? (
                      <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
                    ) : null}
                  </div>
                ))
              : null}
          </div>
        </div>
        <OrderStatusWidget
          order={orderDataRange}
          timeFrame={activeTimeFrame}
          allowedStatus={['pending', 'processing', 'complete', 'cancel']}
        />
      </div>

      {hasAccess(adminAndOwnerOnly, permissions) && (
        <div className="mb-8 flex w-full flex-wrap md:flex-nowrap">
          <ColumnChart
            widgetTitle={t('common:sale-history')}
            colors={['#6073D4']}
            series={salesByYear}
            categories={[
              t('common:january'),
              t('common:february'),
              t('common:march'),
              t('common:april'),
              t('common:may'),
              t('common:june'),
              t('common:july'),
              t('common:august'),
              t('common:september'),
              t('common:october'),
              t('common:november'),
              t('common:december'),
            ]}
          />
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-12">
        <TopRatedProducts
          products={data?.topRatedProducts}
          title={t('text-most-rated-products')}
          className="xl:col-span-5 2xl:me-20"
        />
        <ProductCountByCategory
        //@ts-ignore
          products={data?.categoryWiseProduct}
          title={t('text-most-category-products')}
          className="xl:col-span-7 2xl:ltr:-ml-20 2xl:rtl:-mr-20"
        />
      </div>
    </>
  );
};

const OwnerDashboard = () => {
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);

  return permission ? <ShopList /> : <OwnerShopLayout />;
};

export default OwnerDashboard;
