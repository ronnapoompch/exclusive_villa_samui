import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, Home } from 'lucide-react'

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-red-200">
        <CardHeader className="text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-red-100">
            Administrator privileges required
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Shield className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-red-900 mb-2">Insufficient Permissions</h3>
            <p className="text-sm text-red-700">
              You don't have administrator privileges to access this area. Please contact your system administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/admin/login">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                <Home className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>Error Code: 403 - Forbidden</p>
            <p>This incident has been logged.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}