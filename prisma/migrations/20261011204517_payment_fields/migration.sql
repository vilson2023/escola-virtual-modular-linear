-- AlterTable
ALTER TABLE "student_purchases" ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "asaasCustomerId" TEXT;
