import React from 'react';
import {
  ShoppingBag,
  Coffee,
  Car,
  Bag2,
  House2,
  Game,
  Heart,
  People,
  MagicStar,
  Flash,
  Wallet3,
  ReceiptItem,
  Airplane,
  Teacher,
  Briefcase,
  TrendUp,
  ShieldTick,
  Mobile,
  Crown,
  Cup,
  Bank,
  Card,
  MoneySend,
  WalletMoney,
  UserSquare
} from 'iconsax-react';

interface CategoryIconProps {
  category?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category = '',
  title = '',
  size = 'md',
  className = ''
}) => {
  // Dimension classes
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-11 h-11 rounded-2xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-xl'
  }[size];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const cat = category.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  const searchStr = `${cat} ${t}`;

  // Helper for word-boundary matching (prevents 'car' matching 'care' or 'card')
  const hasWord = (...words: string[]) => {
    return words.some((w) => {
      const escaped = w.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(searchStr);
    });
  };

  // 1. HOME, HOUSE & MAINTENANCE (Matched first so 'home care' doesn't trigger 'car')
  if (
    hasWord('home', 'house', 'rent', 'maintenance', 'apartment', 'housing', 'repair', 'cleaning', 'plumbing', 'utility', 'utilities') ||
    searchStr.includes('home care') ||
    searchStr.includes('home & family')
  ) {
    return (
      <div className={`${sizeClasses} bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <House2 size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 2. FUEL, TRANSPORT & CAR
  if (
    hasWord('fuel', 'transport', 'car', 'cars', 'vehicle', 'ride', 'cab', 'uber', 'bolt', 'petrol', 'diesel', 'gasoline', 'auto') ||
    searchStr.includes('fuel & transport')
  ) {
    return (
      <div className={`${sizeClasses} bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Car size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 3. GROCERIES & MARKET
  if (hasWord('grocery', 'groceries', 'market', 'food', 'supermarket', 'provisions', 'foodstuffs')) {
    return (
      <div className={`${sizeClasses} bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <ShoppingBag size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 4. DINING & TAKEOUT
  if (hasWord('dining', 'takeout', 'restaurant', 'coffee', 'cafe', 'eats', 'drinks', 'lunch', 'dinner', 'breakfast')) {
    return (
      <div className={`${sizeClasses} bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Coffee size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 5. DEBTS & LOANS
  if (hasWord('bank_loan', 'bank loan') || searchStr.includes('bank loan')) {
    return (
      <div className={`${sizeClasses} bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Bank size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (
    hasWord('digital_app', 'digital app', 'carbon', 'fairmoney', 'kuda', 'overdraft', 'opay', 'palmpay', 'renmoney') ||
    searchStr.includes('digital app')
  ) {
    return (
      <div className={`${sizeClasses} bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Mobile size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('cooperative', 'ajo', 'esusu', 'thrift')) {
    return (
      <div className={`${sizeClasses} bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <People size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('personal', 'family', 'sister', 'brother', 'friend', 'relative', 'parent')) {
    return (
      <div className={`${sizeClasses} bg-[#F6F3FA] text-[#8964B3] border border-[#EBE5F5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <UserSquare size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('microfinance', 'micro')) {
    return (
      <div className={`${sizeClasses} bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <WalletMoney size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('credit_card', 'credit card', 'card', 'bnpl')) {
    return (
      <div className={`${sizeClasses} bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Card size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('salary_advance', 'advance')) {
    return (
      <div className={`${sizeClasses} bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <MoneySend size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 6. INCOME & PAYOUTS
  if (hasWord('salary', 'employment', 'wage', 'paycheck', 'payroll')) {
    return (
      <div className={`${sizeClasses} bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Wallet3 size={iconSize} variant="Bulk" />
      </div>
    );
  }

  if (hasWord('freelance', 'retainer', 'contract', 'gig', 'consulting')) {
    return (
      <div className={`${sizeClasses} bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Briefcase size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 7. JAPA & TRAVEL
  if (hasWord('japa', 'travel', 'visa', 'flight', 'vacation', 'trip', 'airline', 'hotel', 'passport')) {
    return (
      <div className={`${sizeClasses} bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Airplane size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 8. WEDDING & CELEBRATIONS
  if (hasWord('wedding', 'ceremony', 'reception', 'ring', 'bridal', 'groom')) {
    return (
      <div className={`${sizeClasses} bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Crown size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 9. SHOPPING & FASHION
  if (hasWord('shopping', 'fashion', 'cloth', 'clothes', 'clothing', 'boutique', 'shoes', 'wear')) {
    return (
      <div className={`${sizeClasses} bg-[#F6F3FA] text-[#8964B3] border border-[#EBE5F5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Bag2 size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 10. EMERGENCY & SAFETY
  if (hasWord('emergency', 'umbrella', 'shield', 'safety', 'urgency')) {
    return (
      <div className={`${sizeClasses} bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <ShieldTick size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 11. ENTERTAINMENT & LEISURE
  if (hasWord('entertainment', 'leisure', 'game', 'gaming', 'movie', 'cinema', 'fun', 'party')) {
    return (
      <div className={`${sizeClasses} bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Game size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 12. HEALTH & WELLNESS
  if (hasWord('health', 'wellness', 'medical', 'hospital', 'doctor', 'pharmacy', 'fitness', 'gym', 'medicine')) {
    return (
      <div className={`${sizeClasses} bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Heart size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 13. EDUCATION & TUITION
  if (hasWord('education', 'tuition', 'school', 'course', 'study', 'training', 'books', 'university')) {
    return (
      <div className={`${sizeClasses} bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Teacher size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 14. BUSINESS & STARTUP
  if (hasWord('business', 'startup', 'company', 'office', 'enterprise', 'venture')) {
    return (
      <div className={`${sizeClasses} bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Briefcase size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 15. TECH & GADGETS
  if (hasWord('tech', 'gadget', 'gadgets', 'phone', 'laptop', 'device', 'hardware', 'software', 'computer')) {
    return (
      <div className={`${sizeClasses} bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Mobile size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 16. INVESTMENTS & STOCKS
  if (hasWord('invest', 'investment', 'stock', 'stocks', 'yield', 'fund', 'dividend', 'shares', 'equity')) {
    return (
      <div className={`${sizeClasses} bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <TrendUp size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 17. GIFTS & SPECIAL CARE
  if (hasWord('gift', 'gifts', 'present', 'beauty', 'celebration', 'birthday')) {
    return (
      <div className={`${sizeClasses} bg-[#FDF4FF] text-[#C026D3] border border-[#F5D0FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <MagicStar size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 18. BILLS & POWER
  if (hasWord('bill', 'bills', 'power', 'electricity', 'nepa', 'ekedc', 'ikedc', 'water', 'internet')) {
    return (
      <div className={`${sizeClasses} bg-[#FFF5F0] text-[#EF713F] border border-[#FFE0D1] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Flash size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // 19. SAVINGS GOAL DEFAULT
  if (hasWord('saving', 'savings', 'goal', 'pot', 'vault')) {
    return (
      <div className={`${sizeClasses} bg-[#F0F7F2] text-[#4A7C59] border border-[#D5EAD9] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
        <Cup size={iconSize} variant="Bulk" />
      </div>
    );
  }

  // Default fallback icon
  return (
    <div className={`${sizeClasses} bg-[#FFF5F0] text-[#EF713F] border border-[#FFE0D1] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
      <ReceiptItem size={iconSize} variant="Bulk" />
    </div>
  );
};
