import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Promotion, PromotionType } from '@/app/types/promotions';
import { Tab } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CouponForm from './promotions/CouponForm';
import FlashSaleForm from './promotions/FlashSaleForm';
import BulkDiscountForm from './promotions/BulkDiscountForm';
import PromotionsList from './promotions/PromotionsList';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PromotionsManagement() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<PromotionType>('COUPON');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const handleCreateNew = (type: PromotionType) => {
    setSelectedType(type);
    setSelectedPromotion(null);
    setIsCreating(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedType(promotion.type);
    setSelectedPromotion(promotion);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedPromotion(null);
  };

  const handleSuccess = () => {
    setIsCreating(false);
    setSelectedPromotion(null);
    router.refresh();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Promotions & Discounts
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your store's promotions, including coupon codes, flash sales, and bulk discounts.
          </p>
        </div>
        {!isCreating && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => handleCreateNew('COUPON')}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Promotion
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        {isCreating ? (
          <div className="bg-white shadow sm:rounded-lg">
            <Tab.Group>
              <Tab.List className="border-b border-gray-200">
                <div className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                      )
                    }
                    onClick={() => setSelectedType('COUPON')}
                  >
                    Coupon Code
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                      )
                    }
                    onClick={() => setSelectedType('FLASH_SALE')}
                  >
                    Flash Sale
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                      )
                    }
                    onClick={() => setSelectedType('BULK_DISCOUNT')}
                  >
                    Bulk Discount
                  </Tab>
                </div>
              </Tab.List>
              <Tab.Panels className="p-6">
                <Tab.Panel>
                  <CouponForm
                    promotion={selectedPromotion}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <FlashSaleForm
                    promotion={selectedPromotion}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <BulkDiscountForm
                    promotion={selectedPromotion}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        ) : (
          <PromotionsList onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}
