import { Ruler, Box, Shield, Info } from "lucide-react"

interface ItemDetailsProps {
  condition: string
  measurements: {
    width?: string
    height?: string
    depth?: string
    weight?: string
  }
  materials: string[]
  preservationStatus?: {
    status: "Excellent" | "Good" | "Fair" | "Poor"
    details: string
  }
  shippingInfo: string
  price: number
}

const ItemDetails = ({
  condition,
  measurements,
  materials,
  preservationStatus,
  shippingInfo,
  price
}: ItemDetailsProps) => {
  const getPreservationStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Fair":
        return "bg-yellow-100 text-yellow-800"
      case "Poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 border">
      {/* Price Section */}
      <div className="flex items-center justify-between border-b pb-4">
        <span className="text-lg font-medium">Price</span>
        <span className="text-2xl font-bold">${price.toFixed(2)}</span>
      </div>

      {/* Condition & Preservation Status */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Info className="w-5 h-5" />
          Condition & Status
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Condition</span>
            <div className="font-medium mt-1">{condition}</div>
          </div>
          {preservationStatus && (
            <div>
              <span className="text-sm text-gray-600">Preservation</span>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPreservationStatusColor(preservationStatus.status)}`}>
                {preservationStatus.status}
              </div>
            </div>
          )}
        </div>
        {preservationStatus?.details && (
          <p className="text-sm text-gray-600 mt-2">{preservationStatus.details}</p>
        )}
      </div>

      {/* Measurements */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Measurements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {measurements.width && (
            <div>
              <span className="text-sm text-gray-600">Width</span>
              <div className="font-medium">{measurements.width}</div>
            </div>
          )}
          {measurements.height && (
            <div>
              <span className="text-sm text-gray-600">Height</span>
              <div className="font-medium">{measurements.height}</div>
            </div>
          )}
          {measurements.depth && (
            <div>
              <span className="text-sm text-gray-600">Depth</span>
              <div className="font-medium">{measurements.depth}</div>
            </div>
          )}
          {measurements.weight && (
            <div>
              <span className="text-sm text-gray-600">Weight</span>
              <div className="font-medium">{measurements.weight}</div>
            </div>
          )}
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Box className="w-5 h-5" />
          Materials
        </h3>
        <div className="flex flex-wrap gap-2">
          {materials.map((material, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {material}
            </span>
          ))}
        </div>
      </div>

      {/* Shipping Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Shipping Details
        </h3>
        <p className="text-sm text-gray-600">{shippingInfo}</p>
      </div>
    </div>
  )
}

export default ItemDetails
