import express from 'express';
import { authenticateToken, requireIndustry } from '../middleware/auth';
import prisma from '../utils/database';
import gamificationService from '../services/gamificationService';

const router = express.Router();

// All logistics routes require Logistics & Shipping industry access
router.use(requireIndustry(['Logistics & Shipping']));

// Get shipments
router.get('/shipments', authenticateToken, async (req: any, res, next) => {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { userId: req.user.id },
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ shipments });
  } catch (error) {
    next(error);
  }
});

// Get vehicles
router.get('/vehicles', authenticateToken, async (req: any, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
});

// Get logistics analytics
router.get('/analytics', authenticateToken, async (req: any, res, next) => {
  try {
    const totalShipments = await prisma.shipment.count({
      where: { userId: req.user.id }
    });

    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: req.user.id }
    });

    const totalVehicles = await prisma.vehicle.count({
      where: { userId: req.user.id }
    });

    const deliveredToday = await prisma.shipment.count({
      where: {
        userId: req.user.id,
        status: 'delivered',
        actualDelivery: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    res.json({
      analytics: {
        totalShipments,
        shipmentsByStatus,
        totalVehicles,
        deliveredToday
      }
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// FUTURE QUICK ACTIONS ENDPOINTS - FOR FRONTEND DASHBOARD INTEGRATION
// =============================================================================
// These endpoints will make the Logistics Dashboard Quick Actions functional:
// 1. Create Shipment, 2. Add Vehicle, 3. Optimize Routes, 4. Track Shipments

// CREATE SHIPMENT - For "Create Shipment" quick action button
router.post('/shipments', authenticateToken, async (req: any, res, next) => {
  try {
    const shipmentData = req.body;
    
    const newShipment = await prisma.shipment.create({
      data: {
        ...shipmentData,
        userId: req.user.id,
        status: shipmentData.status || 'pending',
      },
      include: {
        trackingHistory: true
      }
    });

    // Create initial tracking entry
    await prisma.shipmentTracking.create({
      data: {
        shipmentId: newShipment.id,
        status: 'pending',
        location: shipmentData.origin || 'Origin',
        timestamp: new Date(),
        description: 'Shipment created'
      }
    });

    // Award badges for creating a shipment
    const gamificationResult = await gamificationService.updateProgress({
      userId: req.user.id,
      industry: 'Logistics & Shipping',
      actionType: 'SHIPMENT_CREATED',
      metadata: { shipmentId: newShipment.id, origin: shipmentData.origin, destination: shipmentData.destination }
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      shipment: newShipment,
      gamification: gamificationResult
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE SHIPMENT - For shipment management functionality
router.put('/shipments/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    const updatedShipment = await prisma.shipment.update({
      where: { 
        id: id,
        userId: req.user.id
      },
      data: shipmentData,
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      shipment: updatedShipment
    });
  } catch (error) {
    next(error);
  }
});

// DELETE SHIPMENT - For shipment management functionality
router.delete('/shipments/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete related tracking history first
    await prisma.shipmentTracking.deleteMany({
      where: { shipmentId: id }
    });
    
    // Then delete the shipment
    await prisma.shipment.delete({
      where: { 
        id: id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ADD VEHICLE - For "Add Vehicle" quick action button
router.post('/vehicles', authenticateToken, async (req: any, res, next) => {
  try {
    const vehicleData = req.body;
    
    const newVehicle = await prisma.vehicle.create({
      data: {
        ...vehicleData,
        userId: req.user.id,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: newVehicle
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE VEHICLE - For vehicle management functionality
router.put('/vehicles/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    
    const updatedVehicle = await prisma.vehicle.update({
      where: { 
        id: id,
        userId: req.user.id
      },
      data: vehicleData
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
});

// DELETE VEHICLE - For vehicle management functionality
router.delete('/vehicles/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.vehicle.delete({
      where: { 
        id: id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// OPTIMIZE ROUTES - For "Optimize Routes" quick action button
router.post('/routes/optimize', authenticateToken, async (req: any, res, next) => {
  try {
    const { shipmentIds, vehicleId, constraints } = req.body;
    
    // TODO: Implement route optimization algorithm or integrate with third-party service
    // This could use algorithms like Traveling Salesman Problem (TSP) solvers
    // Or integrate with services like Google Maps Route Optimization API
    
    res.status(501).json({
      success: false,
      message: 'Route optimization endpoint ready for implementation',
      data: {
        shipmentIds,
        vehicleId,
        constraints,
        note: 'Consider integrating with Google Maps API or implementing TSP algorithm'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/routes/suggestions', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Provide route suggestions based on current shipments
    const suggestions: any[] = [];
    
    res.json({
      success: true,
      suggestions: suggestions,
      message: 'Route suggestions endpoint ready for implementation'
    });
  } catch (error) {
    next(error);
  }
});

// TRACK SHIPMENTS - For "Track Shipments" quick action button
router.get('/shipments/:id/tracking', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    const shipmentWithTracking = await prisma.shipment.findFirst({
      where: { 
        id: id,
        userId: req.user.id
      },
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!shipmentWithTracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      shipment: shipmentWithTracking,
      currentStatus: shipmentWithTracking.trackingHistory[0] || null
    });
  } catch (error) {
    next(error);
  }
});

// ADD TRACKING UPDATE - For shipment tracking functionality
router.post('/shipments/:id/tracking', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const trackingData = req.body;
    
    // Verify shipment belongs to user
    const shipment = await prisma.shipment.findFirst({
      where: { 
        id: id,
        userId: req.user.id
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const trackingUpdate = await prisma.shipmentTracking.create({
      data: {
        shipmentId: id,
        ...trackingData,
        timestamp: new Date()
      }
    });

    // Update shipment status if provided
    if (trackingData.status) {
      await prisma.shipment.update({
        where: { id: id },
        data: { status: trackingData.status }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tracking update added successfully',
      tracking: trackingUpdate
    });
  } catch (error) {
    next(error);
  }
});

// BULK TRACKING - For tracking multiple shipments
router.post('/shipments/tracking/bulk', authenticateToken, async (req: any, res, next) => {
  try {
    const { shipmentIds } = req.body;
    
    const shipmentsWithTracking = await prisma.shipment.findMany({
      where: { 
        id: { in: shipmentIds },
        userId: req.user.id
      },
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1 // Get only the latest tracking info
        }
      }
    });

    res.json({
      success: true,
      shipments: shipmentsWithTracking,
      message: 'Bulk tracking information retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// FLEET MANAGEMENT - Additional helpful endpoints
router.get('/fleet/status', authenticateToken, async (req: any, res, next) => {
  try {
    const fleetStatus = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        licensePlate: true,
        vehicleType: true,
        status: true,
        currentLocation: true,
        capacity: true
      }
    });

    res.json({
      success: true,
      fleet: fleetStatus,
      message: 'Fleet status retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// End of future quick actions endpoints



export default router;