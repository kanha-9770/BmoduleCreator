import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus } from "lucide-react"
import { WarehouseStats } from "@/components/masters/warehouse-stats"
import { WarehouseTable } from "@/components/masters/warehouse-table"

const warehouses = [
  {
    id: "WH-001",
    name: "Main Warehouse",
    code: "MAIN-WH",
    type: "Distribution Center",
    address: "123 Industrial Ave, Manufacturing District",
    city: "New York",
    state: "NY",
    country: "USA",
    pincode: "10001",
    manager: "John Manager",
    phone: "+1-555-0123",
    email: "john.manager@company.com",
    capacity: 50000,
    currentUtilization: 35000,
    zones: 8,
    locations: 120,
    bins: 480,
    status: "Active",
    establishedDate: "2020-01-15",
  },
  {
    id: "WH-002",
    name: "Secondary Warehouse",
    code: "SEC-WH",
    type: "Storage Facility",
    address: "456 Storage Blvd, Industrial Park",
    city: "Chicago",
    state: "IL",
    country: "USA",
    pincode: "60601",
    manager: "Sarah Storage",
    phone: "+1-555-0456",
    email: "sarah.storage@company.com",
    capacity: 30000,
    currentUtilization: 22000,
    zones: 6,
    locations: 80,
    bins: 320,
    status: "Active",
    establishedDate: "2021-03-20",
  },
  {
    id: "WH-003",
    name: "Raw Materials Warehouse",
    code: "RM-WH",
    type: "Raw Material Storage",
    address: "789 Materials St, Supply Chain Hub",
    city: "Detroit",
    state: "MI",
    country: "USA",
    pincode: "48201",
    manager: "Mike Materials",
    phone: "+1-555-0789",
    email: "mike.materials@company.com",
    capacity: 25000,
    currentUtilization: 18000,
    zones: 4,
    locations: 60,
    bins: 240,
    status: "Active",
    establishedDate: "2019-11-10",
  },
  {
    id: "WH-004",
    name: "Finished Goods Warehouse",
    code: "FG-WH",
    type: "Finished Goods Storage",
    address: "321 Finished Ave, Product Center",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    pincode: "90001",
    manager: "Lisa Logistics",
    phone: "+1-555-0321",
    email: "lisa.logistics@company.com",
    capacity: 40000,
    currentUtilization: 28000,
    zones: 7,
    locations: 100,
    bins: 400,
    status: "Active",
    establishedDate: "2022-05-15",
  },
  {
    id: "WH-005",
    name: "JAIPUR WAREHOUSE",
    code: "JPR-WH",
    type: "Regional Distribution Center",
    address: "Plot No. 45, Industrial Area, Sitapura",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    pincode: "302022",
    manager: "Rajesh Kumar",
    phone: "+91-141-2345678",
    email: "rajesh.kumar@company.com",
    capacity: 35000,
    currentUtilization: 24500,
    zones: 6,
    locations: 90,
    bins: 360,
    status: "Active",
    establishedDate: "2023-02-10",
  },
  {
    id: "WH-006",
    name: "MUMBAI WAREHOUSE",
    code: "MUM-WH",
    type: "Port Distribution Center",
    address: "Warehouse Complex, JNPT Road, Panvel",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "410206",
    manager: "Priya Sharma",
    phone: "+91-22-27451234",
    email: "priya.sharma@company.com",
    capacity: 60000,
    currentUtilization: 45000,
    zones: 10,
    locations: 150,
    bins: 600,
    status: "Active",
    establishedDate: "2022-08-15",
  },
  {
    id: "WH-007",
    name: "ON THE WAY",
    code: "OTW-WH",
    type: "Transit Hub",
    address: "Mobile Transit Operations",
    city: "Various",
    state: "Multiple",
    country: "India",
    pincode: "000000",
    manager: "Transit Team",
    phone: "+91-98765-43210",
    email: "transit@company.com",
    capacity: 5000,
    currentUtilization: 3200,
    zones: 2,
    locations: 20,
    bins: 80,
    status: "Active",
    establishedDate: "2023-01-01",
  },
]

const warehouseTypes = [
  { name: "Distribution Center", count: 2 },
  { name: "Storage Facility", count: 1 },
  { name: "Raw Material Storage", count: 1 },
  { name: "Finished Goods Storage", count: 1 },
  { name: "Regional Distribution Center", count: 1 },
  { name: "Port Distribution Center", count: 1 },
  { name: "Transit Hub", count: 1 },
  { name: "Cold Storage", count: 0 },
  { name: "Hazardous Material Storage", count: 0 },
]

export default function WarehousesPage() {
  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0)
  const totalUtilization = warehouses.reduce((sum, wh) => sum + wh.currentUtilization, 0)
  const utilizationPercentage = (totalUtilization / totalCapacity) * 100
  const totalLocations = warehouses.reduce((sum, wh) => sum + wh.locations, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Masters</h1>
          <p className="text-muted-foreground">Manage warehouse locations and storage facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            View Map
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <WarehouseStats
        totalWarehouses={warehouses.length}
        totalCapacity={totalCapacity}
        totalUtilization={totalUtilization}
        totalLocations={totalLocations}
        utilizationPercentage={utilizationPercentage}
      />

      {/* Warehouse Table */}
      <WarehouseTable warehouses={warehouses} />

      {/* Warehouse Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {warehouseTypes.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{type.name}</span>
                <span className="text-sm text-muted-foreground">{type.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
