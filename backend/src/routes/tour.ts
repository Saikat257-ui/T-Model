import express from 'express';
import { authenticateToken, requireIndustry } from '../middleware/auth';
import prisma from '../utils/database';
import gamificationService from '../services/gamificationService';

const router = express.Router();

// All tour routes require Tour Management industry access
router.use(requireIndustry(['Tour Management']));

// Get tour packages
router.get('/packages', authenticateToken, async (req: any, res, next) => {
  try {
    const packages = await prisma.tourPackage.findMany({
      where: { userId: req.user.id },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            participants: true,
            startDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ packages });
  } catch (error) {
    next(error);
  }
});

// Get tour bookings
router.get('/bookings', authenticateToken, async (req: any, res, next) => {
  try {
    const bookings = await prisma.tourBooking.findMany({
      include: {
        tourPackage: {
          select: {
            name: true,
            destinations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// Get tour analytics
router.get('/analytics', authenticateToken, async (req: any, res, next) => {
  try {
    const totalPackages = await prisma.tourPackage.count({
      where: { userId: req.user.id }
    });

    const totalBookings = await prisma.tourBooking.count({
      where: {
        tourPackage: { userId: req.user.id }
      }
    });

    const revenue = await prisma.tourBooking.aggregate({
      _sum: { totalAmount: true },
      where: {
        tourPackage: { userId: req.user.id },
        status: 'completed'
      }
    });

    res.json({
      analytics: {
        totalPackages,
        totalBookings,
        totalRevenue: revenue._sum.totalAmount || 0
      }
    });
  } catch (error) {
    next(error);
  }
});


// =============================================================================
// FUTURE QUICK ACTIONS ENDPOINTS - FOR FRONTEND DASHBOARD INTEGRATION
// =============================================================================
// These endpoints will make the Tour Dashboard Quick Actions functional:
// 1. Create Package, 2. Manage Guides, 3. View Analytics, 4. Customer Support

// CREATE PACKAGE - For "Create Package" quick action button
router.post('/packages', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Add validation middleware for package data
    const packageData = req.body;
    
    const newPackage = await prisma.tourPackage.create({
      data: {
        ...packageData,
        userId: req.user.id, // Ensure package belongs to authenticated user
      },
      include: {
        bookings: true
      }
    });

    // Award badges for creating a tour package
    const gamificationResult = await gamificationService.updateProgress({
      userId: req.user.id,
      industry: 'Tour Management',
      actionType: 'TOUR_CREATED',
      metadata: { packageId: newPackage.id, packageName: newPackage.name }
    });

    res.status(201).json({ 
      success: true,
      message: 'Tour package created successfully',
      package: newPackage,
      gamification: gamificationResult
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE PACKAGE - For package management functionality
router.put('/packages/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const packageData = req.body;
    
    const updatedPackage = await prisma.tourPackage.update({
      where: { 
        id: id,
        userId: req.user.id // Ensure user can only update their own packages
      },
      data: packageData,
      include: {
        bookings: true
      }
    });

    res.json({ 
      success: true,
      message: 'Tour package updated successfully',
      package: updatedPackage 
    });
  } catch (error) {
    next(error);
  }
});

// DELETE PACKAGE - For package management functionality
router.delete('/packages/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.tourPackage.delete({
      where: { 
        id: id,
        userId: req.user.id // Ensure user can only delete their own packages
      }
    });

    res.json({ 
      success: true,
      message: 'Tour package deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

// MANAGE GUIDES - For "Manage Guides" quick action button
// Note: This assumes a Guide model exists or will be created
router.get('/guides', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Create Guide model in Prisma schema if not exists
    // For now, return placeholder response
    const guides: any[] = []; // await prisma.guide.findMany({ where: { userId: req.user.id } });
    
    res.json({ 
      success: true,
      guides: guides,
      message: 'Guide management endpoint ready for implementation'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/guides', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Implement guide creation logic
    const guideData = req.body;
    
    res.status(501).json({ 
      success: false,
      message: 'Guide creation endpoint ready for implementation',
      data: guideData
    });
  } catch (error) {
    next(error);
  }
});

// DETAILED ANALYTICS - For "View Analytics" quick action button
router.get('/analytics/detailed', authenticateToken, async (req: any, res, next) => {
  try {
    // Enhanced analytics with more detailed breakdown
    const [
      totalPackages,
      totalBookings,
      revenue,
      monthlyStats,
      popularDestinations
    ] = await Promise.all([
      prisma.tourPackage.count({ where: { userId: req.user.id } }),
      prisma.tourBooking.count({
        where: { tourPackage: { userId: req.user.id } }
      }),
      prisma.tourBooking.aggregate({
        _sum: { totalAmount: true },
        where: {
          tourPackage: { userId: req.user.id },
          status: 'completed'
        }
      }),
      prisma.tourBooking.groupBy({
        by: ['createdAt'],
        _count: true,
        where: { tourPackage: { userId: req.user.id } }
      }),
      prisma.tourPackage.groupBy({
        by: ['destinations'],
        _count: true,
        where: { userId: req.user.id },
        orderBy: { _count: { destinations: 'desc' } },
        take: 5
      })
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalPackages,
          totalBookings,
          totalRevenue: revenue._sum.totalAmount || 0
        },
        monthlyStats,
        popularDestinations,
        message: 'Detailed analytics ready for dashboard integration'
      }
    });
  } catch (error) {
    next(error);
  }
});

// CUSTOMER SUPPORT - For "Customer Support" quick action button
router.get('/support/tickets', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Create SupportTicket model in Prisma schema if not exists
    // For now, return placeholder response
    const tickets: any[] = []; // await prisma.supportTicket.findMany({ where: { userId: req.user.id } });
    
    res.json({ 
      success: true,
      tickets: tickets,
      message: 'Customer support endpoint ready for implementation'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/support/tickets', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Implement support ticket creation logic
    const ticketData = req.body;
    
    res.status(501).json({ 
      success: false,
      message: 'Support ticket creation endpoint ready for implementation',
      data: ticketData
    });
  } catch (error) {
    next(error);
  }
});

// End of future quick actions endpoints



export default router;