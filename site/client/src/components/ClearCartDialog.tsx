/* Farmaville — Care Counter: confirmação explícita para ação destrutiva da sacola. */
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useShop } from "@/contexts/ShopContext";

type ClearCartDialogProps = { className?: string };

export default function ClearCartDialog({ className = "" }: ClearCartDialogProps) {
  const { cartCount, clearCart } = useShop();
  const [open, setOpen] = useState(false);
  const confirmClear = () => {
    clearCart();
    setOpen(false);
    toast.success("Sacola esvaziada", { description: "Os produtos foram removidos do seu pedido." });
  };
  return <AlertDialog open={open} onOpenChange={setOpen}><AlertDialogTrigger asChild><button type="button" className={className} disabled={cartCount === 0}><Trash2 size={14} /> Esvaziar sacola</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Esvaziar sua sacola?</AlertDialogTitle><AlertDialogDescription>Todos os {cartCount} item(ns) serão removidos. Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter produtos</AlertDialogCancel><AlertDialogAction onClick={confirmClear}>Esvaziar sacola</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
