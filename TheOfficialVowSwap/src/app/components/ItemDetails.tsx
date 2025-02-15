import { Ruler, Box, Shield, Info } from "lucide-react"

/**
 * MeasurementItem Component
 * Renders a single measurement field with a label and value
 */
const MeasurementItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-sm text-gray-600">{label}</span>
    <div className="font-medium">{value}</div>
  </div>
)

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
  shippingInfo?: string
  price: number
}

/**
 * ItemDetails Component
 * 
 * Displays comprehensive product information including price, condition,
 * measurements, materials, preservation status, and shipping details.
 * Implements accessibility features and provides fallbacks for missing data.
 */
const ItemDetails = ({
  condition,
  measurements,
  materials,
  preservationStatus,
  shippingInfo,
  price
}: ItemDetailsProps) => {
  /**
   * Returns the appropriate color classes based on preservation status
   * Green for Excellent, Blue for Good, Yellow for Fair, Red for Poor
   */
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

  // Common styles for consistent icon rendering
  const iconClass = "w-5 h-5 text-gray-600"

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 border">
      {/* Price Section */}
      <div 
        role="region" 
        aria-label="Product Price"
        className="flex items-center justify-between border-b pb-4"
      >
        <span className="text-lg font-medium">Price</span>
        <span className="text-2xl font-bold">${price.toFixed(2)}</span>
      </div>

      {/* Condition & Preservation Status */}
      <div 
        role="region" 
        aria-label="Product Condition and Preservation Status"
        className="space-y-3"
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Info className={iconClass} aria-hidden="true" />
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
        <p className="text-sm text-gray-600 mt-2">
          {preservationStatus?.details || "Preservation details not available"}
        </p>
      </div>

      {/* Measurements */}
      <div 
        role="region" 
        aria-label="Product Measurements"
        className="space-y-3"
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Ruler className={iconClass} aria-hidden="true" />
          Measurements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(measurements).map(([key, value]) => (
            value && (
              <MeasurementItem
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
              />
            )
          ))}
          {Object.values(measurements).every(v => !v) && (
            <p className="text-sm text-gray-600">Measurements not available</p>
          )}
        </div>
      </div>

      {/* Materials */}
      <div 
        role="region" 
        aria-label="Product Materials"
        className="space-y-3"
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Box className={iconClass} aria-hidden="true" />
          Materials
        </h3>
        <div className="flex flex-wrap gap-2">
          {materials.length > 0 ? (
            // Using index as key since materials might not have unique identifiers
            // TODO: Consider adding unique IDs to materials data structure
            materials.map((material, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {material}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-600">Materials information not available</p>
          )}
        </div>
      </div>

      {/* Shipping Information */}
      <div 
        role="region" 
        aria-label="Shipping Information"
        className="space-y-3"
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Shield className={iconClass} aria-hidden="true" />
          Shipping Details
        </h3>
        <p className="text-sm text-gray-600">
          {shippingInfo || "Shipping information not available"}
        </p>
      </div>
    </div>
  )
}

export default ItemDetails
