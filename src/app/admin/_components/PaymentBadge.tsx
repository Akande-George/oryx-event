import { Badge } from "@/components/ui/badge";

type PaymentStatus =
  | "unpaid"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | undefined;

const STYLES: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  unpaid: "bg-yellow-50 text-yellow-700 border-yellow-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function PaymentBadge({ status }: { status: PaymentStatus }) {
  const key = status ?? "unpaid";
  return (
    <Badge className={`text-xs ${STYLES[key] ?? STYLES.unpaid}`}>{key}</Badge>
  );
}
