import Swal from 'sweetalert2';
import { Pocket, Transaction } from '../types';
import { formatCurrency } from './formatters';
import { getTranslation, translations } from './translations';

/**
 * Prompts the user to confirm voiding (cancelling) a transaction and
 * reverses its balance effect via `voidTransaction`.
 */
export const confirmAndVoidTransaction = (
  tx: Transaction,
  pockets: Pocket[],
  lang: 'id' | 'en',
  voidTransaction: (id: string) => void
): void => {
  if (tx.voided) return;

  const formattedAmount = formatCurrency(tx.amount);
  const pocket = tx.pocketId ? pockets.find((p) => p.id === tx.pocketId) : undefined;

  let detailText = '';
  if (tx.type === 'expense') {
    detailText = pocket
      ? translations[lang].confirmVoidExpenseDesc(formattedAmount, pocket.name)
      : translations[lang].confirmVoidExpenseFallbackDesc(formattedAmount);
  } else if (tx.type === 'income' || tx.type === 'transfer_in') {
    detailText = translations[lang].confirmVoidIncomeDesc(formattedAmount);
  } else if (tx.type === 'transfer_out') {
    detailText = translations[lang].confirmVoidTransferDesc(
      formattedAmount,
      pocket?.name || getTranslation(lang, 'deletedPocket')
    );
  }

  Swal.fire({
    title: getTranslation(lang, 'confirmVoidTxTitle'),
    text: `${tx.description} — ${detailText}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#64748b',
    confirmButtonText: getTranslation(lang, 'yesVoid'),
    cancelButtonText: getTranslation(lang, 'cancel'),
  }).then((result) => {
    if (!result.isConfirmed) return;

    try {
      voidTransaction(tx.id);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'transactionVoided'),
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      Swal.fire({
        icon: 'error',
        title: getTranslation(lang, 'voidErrorTitle'),
        text: msg,
        confirmButtonColor: '#0ea5e9',
      });
    }
  });
};
