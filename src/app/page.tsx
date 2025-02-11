import { getInventoryItems } from "@/lib/actions/inventory";
import { AddInventoryForm } from "@/components/inventory/add-item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItem } from "../../db/schema";

export default async function Home() {
  const inventory = await getInventoryItems();

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Inventory Item</CardTitle>
        </CardHeader>
        <CardContent>
          <AddInventoryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item: InventoryItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.supplierContact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}