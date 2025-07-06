"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  LogOut,
  Eye,
  Check,
  X,
} from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee"
  phone?: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

interface Sale {
  id: string
  customer_name: string
  product_name: string
  product_id?: string
  amount: number
  quantity: number
  employee_id: string
  employee_name?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  salary: number
  hire_date: string
  status: "active" | "inactive"
}

// Datos de prueba
const DEMO_USERS = [
  {
    id: "1",
    email: "admin@negocio.com",
    password: "admin123",
    name: "Administrador",
    role: "admin" as const,
    phone: "+51999999999",
  },
  {
    id: "2",
    email: "empleado@negocio.com",
    password: "emp123",
    name: "Juan Empleado",
    role: "employee" as const,
    phone: "+51987654321",
  },
]

export default function BusinessAdmin() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para datos
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Coca Cola 500ml", price: 3.5, stock: 100, category: "Bebidas" },
    { id: "2", name: "Pan Integral", price: 4.2, stock: 50, category: "Panadería" },
    { id: "3", name: "Leche Gloria 1L", price: 5.8, stock: 30, category: "Lácteos" },
    { id: "4", name: "Arroz Superior 1kg", price: 4.5, stock: 80, category: "Abarrotes" },
  ])

  const [sales, setSales] = useState<Sale[]>([
    {
      id: "1",
      customer_name: "María García",
      product_name: "Coca Cola 500ml",
      product_id: "1",
      amount: 7.0,
      quantity: 2,
      employee_id: "2",
      employee_name: "Juan Empleado",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ])

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Juan Empleado",
      email: "empleado@negocio.com",
      phone: "+51987654321",
      position: "Vendedor",
      salary: 1200,
      hire_date: "2024-01-01",
      status: "active",
    },
  ])

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" })
  const [newSale, setNewSale] = useState({ customer_name: "", product_id: "", quantity: "1" })
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    salary: "",
  })

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = DEMO_USERS.find((u) => u.email === loginForm.email && u.password === loginForm.password)

    if (!foundUser) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    const userData: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      phone: foundUser.phone,
    }

    setUser(userData)
    localStorage.setItem("business_user", JSON.stringify(userData))
    setSuccess("¡Bienvenido!")
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("business_user")
    setLoginForm({ email: "", password: "" })
  }

  // Verificar sesión al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("business_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setError("Completa todos los campos del producto")
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock),
      category: newProduct.category || "Sin categoría",
    }

    setProducts([...products, product])
    setNewProduct({ name: "", price: "", stock: "", category: "" })
    setSuccess("Producto agregado correctamente")
  }

  const addSale = () => {
    if (!newSale.customer_name || !newSale.product_id) {
      setError("Completa todos los campos de la venta")
      return
    }

    const product = products.find((p) => p.id === newSale.product_id)
    if (!product) {
      setError("Producto no encontrado")
      return
    }

    const quantity = Number.parseInt(newSale.quantity)
    if (product.stock < quantity) {
      setError("Stock insuficiente")
      return
    }

    const sale: Sale = {
      id: Date.now().toString(),
      customer_name: newSale.customer_name,
      product_name: product.name,
      product_id: product.id,
      amount: product.price * quantity,
      quantity: quantity,
      employee_id: user?.id || "",
      employee_name: user?.name || "",
      status: user?.role === "admin" ? "approved" : "pending",
      created_at: new Date().toISOString(),
    }

    setSales([sale, ...sales])

    // Si es admin, actualizar stock inmediatamente
    if (user?.role === "admin") {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, stock: p.stock - quantity } : p)))
    }

    setNewSale({ customer_name: "", product_id: "", quantity: "1" })
    setSuccess("Venta registrada correctamente")
  }

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      setError("Completa todos los campos obligatorios")
      return
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      salary: Number.parseFloat(newEmployee.salary) || 0,
      hire_date: new Date().toISOString().split("T")[0],
      status: "active",
    }

    setEmployees([...employees, employee])
    setNewEmployee({ name: "", email: "", password: "", phone: "", position: "", salary: "" })
    setSuccess("Empleado agregado correctamente")
  }

  const approveSale = (saleId: string, approve: boolean) => {
    setSales(
      sales.map((sale) => {
        if (sale.id === saleId) {
          // Si se aprueba, actualizar stock
          if (approve && sale.product_id) {
            setProducts(products.map((p) => (p.id === sale.product_id ? { ...p, stock: p.stock - sale.quantity } : p)))
          }
          return { ...sale, status: approve ? "approved" : "rejected" }
        }
        return sale
      }),
    )
    setSuccess(`Venta ${approve ? "aprobada" : "rechazada"} correctamente`)
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    setSuccess("Producto eliminado")
  }

  const totalSales = sales.filter((s) => s.status === "approved").reduce((sum, sale) => sum + sale.amount, 0)
  const pendingSales = sales.filter((s) => s.status === "pending").length

  // Pantalla de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
            <CardDescription>Inicia sesión para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={login} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@negocio.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="admin123"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm space-y-2">
              <p className="font-medium">🔑 Credenciales de prueba:</p>
              <div className="space-y-1">
                <p>
                  <strong>Admin:</strong> admin@negocio.com / admin123
                </p>
                <p>
                  <strong>Empleado:</strong> empleado@negocio.com / emp123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista para empleados
  if (user.role === "employee") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Ventas</h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <Button onClick={logout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Venta</CardTitle>
                <CardDescription>Registra una nueva venta (requiere aprobación del admin)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Cliente</Label>
                  <Input
                    id="customer"
                    value={newSale.customer_name}
                    onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="product">Producto</Label>
                  <select
                    id="product"
                    value={newSale.product_id}
                    onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar producto</option>
                    {products
                      .filter((p) => p.stock > 0)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - S/ {product.price} (Stock: {product.stock})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  />
                </div>
                <Button onClick={addSale} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Venta
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mis Ventas de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sales
                    .filter((sale) => {
                      const today = new Date().toDateString()
                      const saleDate = new Date(sale.created_at).toDateString()
                      return sale.employee_id === user.id && saleDate === today
                    })
                    .slice(0, 5)
                    .map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sale.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{sale.product_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">S/ {sale.amount}</p>
                          <Badge
                            variant={
                              sale.status === "approved"
                                ? "default"
                                : sale.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {sale.status === "approved"
                              ? "Aprobada"
                              : sale.status === "pending"
                                ? "Pendiente"
                                : "Rechazada"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Vista para administrador
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Bienvenido, {user.name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 p-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 p-3">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2 p-3">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Ventas</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2 p-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Empleados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Aprobadas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ {totalSales.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">En inventario</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Pendientes</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingSales}</div>
                  <p className="text-xs text-muted-foreground">Por revisar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empleados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.filter((e) => e.status === "active").length}</div>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas Pendientes de Aprobación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sales
                      .filter((s) => s.status === "pending")
                      .slice(0, 5)
                      .map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{sale.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sale.product_name} x{sale.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">Por: {sale.employee_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">S/ {sale.amount}</span>
                            <Button size="sm" onClick={() => approveSale(sale.id, true)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => approveSale(sale.id, false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    {sales.filter((s) => s.status === "pending").length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No hay ventas pendientes</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productos con Stock Bajo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .filter((p) => p.stock <= 10)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Producto</CardTitle>
                <CardDescription>Añade nuevos productos a tu inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="product-name">Nombre</Label>
                    <Input
                      id="product-name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-price">Precio</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-stock">Stock</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="Cantidad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-category">Categoría</Label>
                    <Input
                      id="product-category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Categoría"
                    />
                  </div>
                </div>
                <Button onClick={addProduct} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm">Stock: {product.stock} unidades</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">S/ {product.price}</span>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{sale.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sale.product_name} x{sale.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Por: {sale.employee_name} - {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">S/ {sale.amount}</p>
                        <Badge
                          variant={
                            sale.status === "approved"
                              ? "default"
                              : sale.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {sale.status === "approved"
                            ? "Aprobada"
                            : sale.status === "pending"
                              ? "Pendiente"
                              : "Rechazada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Empleado</CardTitle>
                <CardDescription>Registra nuevos empleados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee-name">Nombre Completo</Label>
                    <Input
                      id="employee-name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee-email">Email</Label>
                    <Input
                      id="employee-email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee-phone">Teléfono</Label>
                    <Input
                      id="employee-phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="+51987654321"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee-position">Cargo</Label>
                    <Input
                      id="employee-position"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      placeholder="Vendedor, Cajero, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee-salary">Salario (S/)</Label>
                    <Input
                      id="employee-salary"
                      type="number"
                      step="0.01"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                      placeholder="1200.00"
                    />
                  </div>
                </div>
                <Button onClick={addEmployee} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Empleado
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Empleados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{employee.name}</h3>
                          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                            {employee.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{employee.position}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </div>
                          )}
                          <span>Salario: S/ {employee.salary}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
