import dbConnect from './mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function deductBalance(userId: string, amount: number, description: string) {
  await dbConnect();
  
  // Ensure amount is a valid number
  const validAmount = parseFloat(String(amount));
  if (isNaN(validAmount) || validAmount <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  const user = await User.findById(userId);
  
  if (!user) return { success: false, error: 'User not found' };
  
  // Ensure walletBalance is a valid number
  const currentBalance = parseFloat(String(user.walletBalance)) || 0;
  
  if (currentBalance < validAmount) {
    return { success: false, error: 'Insufficient funds' };
  }

  // Deduct and ensure result is a valid number
  user.walletBalance = currentBalance - validAmount;
  
  // Safety check: if somehow NaN, set to 0
  if (isNaN(user.walletBalance)) {
    user.walletBalance = 0;
  }
  
  await user.save();

  await Transaction.create({
    userId,
    type: 'number_rental',
    description,
    amount: validAmount,
    status: 'success'
  });

  return { success: true, newBalance: user.walletBalance };
}
