import { Wallet } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as financeIndex } from '@/routes/finance';

export default function FinanceIndex() {
    return (
        <ModulePage
            title="Finance"
            description="Manage quotations, invoices, partial payments, expenses, balances, and job profitability."
            phase="Phase 4"
            icon={Wallet}
            emptyTitle="No financial records"
            emptyDescription="Issue the first invoice after completed work to begin tracking customer payments and job costs."
            actionLabel="Create your first invoice"
            capabilities={[
                'Quotes, approvals, and accepted work',
                'Invoices, due dates, and partial payments',
                'USD and SOS transaction currencies',
                'Expenses, vendor balances, and profit',
            ]}
        />
    );
}

FinanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Finance',
            href: financeIndex(),
        },
    ],
};
