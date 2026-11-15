$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api'
$email = "smoke-$([guid]::NewGuid().ToString('N').Substring(0,8))@fleetflow.local"
$password = 'FleetFlowLocal!2026'

Write-Host "[1/7] Register test account: $email" -ForegroundColor Cyan
$auth = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{ email = $email; password = $password } | ConvertTo-Json)
$headers = @{ Authorization = "Bearer $($auth.accessToken)" }

Write-Host '[2/7] Create customer' -ForegroundColor Cyan
$customer = Invoke-RestMethod -Method Post -Uri "$base/customers" -Headers $headers -ContentType 'application/json' -Body (@{
  fullName = 'FleetFlow Smoke Test'; email = "customer-$email"; phone = '+84900000000'; address = 'Bien Hoa, Dong Nai, Viet Nam'
} | ConvertTo-Json)

Write-Host '[3/7] Create shipment order (publishes order.created)' -ForegroundColor Cyan
$order = Invoke-RestMethod -Method Post -Uri "$base/orders" -Headers $headers -ContentType 'application/json' -Body (@{
  customerId = $customer.id; originAddress = 'Bien Hoa, Dong Nai'; destinationAddress = 'Thu Duc, Ho Chi Minh City'; packageDescription = 'Smoke test parcel'; status = 'PENDING'
} | ConvertTo-Json)

Write-Host '[4/7] Wait for RabbitMQ consumers' -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host '[5/7] Verify shipment was created' -ForegroundColor Cyan
$shipments = Invoke-RestMethod -Method Get -Uri "$base/shipments" -Headers $headers
$shipment = $shipments | Where-Object { $_.orderId -eq $order.id } | Select-Object -First 1
if (-not $shipment) { throw "No shipment generated for order $($order.id)" }

Write-Host '[6/7] Verify tracking event and notification' -ForegroundColor Cyan
$tracking = Invoke-RestMethod -Method Get -Uri "$base/tracking" -Headers $headers
$trackingEvent = $tracking | Where-Object { $_.trackingCode -eq $shipment.trackingCode } | Select-Object -First 1
$notifications = Invoke-RestMethod -Method Get -Uri "$base/notifications" -Headers $headers
$notification = $notifications | Where-Object { $_.recipient -eq "customer:$($customer.id)" } | Select-Object -Last 1
if (-not $trackingEvent) { throw "No tracking event found for $($shipment.trackingCode)" }
if (-not $notification) { throw "No notification found for order $($order.id)" }

Write-Host '[7/7] PASS — local order-to-tracking event flow verified' -ForegroundColor Green
[pscustomobject]@{
  Account = $email
  CustomerId = $customer.id
  OrderId = $order.id
  ShipmentId = $shipment.id
  TrackingCode = $shipment.trackingCode
  InitialTrackingStatus = $trackingEvent.status
  NotificationStatus = $notification.status
} | Format-List
