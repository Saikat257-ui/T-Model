import express from 'express';
import { authenticateToken, requireIndustry } from '../middleware/auth';
import prisma from '../utils/database';
import gamificationService from '../services/gamificationService';

const router = express.Router();

// All travel routes require Travel Services industry access
router.use(requireIndustry(['Travel Services']));

// Get travel bookings
router.get('/bookings', authenticateToken, async (req: any, res, next) => {
  try {
    const bookings = await prisma.travelBooking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// Get travel documents
router.get('/documents', authenticateToken, async (req: any, res, next) => {
  try {
    const documents = await prisma.travelDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

// Get travel analytics
router.get('/analytics', authenticateToken, async (req: any, res, next) => {
  try {
    const totalBookings = await prisma.travelBooking.count({
      where: { userId: req.user.id }
    });

    const bookingsByType = await prisma.travelBooking.groupBy({
      by: ['type'],
      _count: true,
      where: { userId: req.user.id }
    });

    const totalSpent = await prisma.travelBooking.aggregate({
      _sum: { totalAmount: true },
      where: { 
        userId: req.user.id,
        status: 'completed' 
      }
    });

    res.json({
      analytics: {
        totalBookings,
        bookingsByType,
        totalSpent: totalSpent._sum.totalAmount || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// FUTURE QUICK ACTIONS ENDPOINTS - FOR FRONTEND DASHBOARD INTEGRATION
// =============================================================================
// These endpoints will make the Travel Dashboard Quick Actions functional:
// 1. Book Flight, 2. Book Hotel, 3. Upload Document, 4. Plan Itinerary

// BOOK FLIGHT - For "Book Flight" quick action button
router.post('/bookings/flight', authenticateToken, async (req: any, res, next) => {
  try {
    const flightData = req.body;
    
    const flightBooking = await prisma.travelBooking.create({
      data: {
        ...flightData,
        type: 'flight',
        userId: req.user.id,
      }
    });

    // Award badges for creating a booking
    const gamificationResult = await gamificationService.updateProgress({
      userId: req.user.id,
      industry: 'Travel Services',
      actionType: 'BOOKING_CREATED',
      metadata: { bookingId: flightBooking.id, type: 'flight' }
    });

    res.status(201).json({
      success: true,
      message: 'Flight booking created successfully',
      booking: flightBooking,
      gamification: gamificationResult
    });
  } catch (error) {
    next(error);
  }
});

// BOOK HOTEL - For "Book Hotel" quick action button
router.post('/bookings/hotel', authenticateToken, async (req: any, res, next) => {
  try {
    const hotelData = req.body;
    
    const hotelBooking = await prisma.travelBooking.create({
      data: {
        ...hotelData,
        type: 'hotel',
        userId: req.user.id,
      }
    });

    // Award badges for creating a booking
    const gamificationResult = await gamificationService.updateProgress({
      userId: req.user.id,
      industry: 'Travel Services',
      actionType: 'BOOKING_CREATED',
      metadata: { bookingId: hotelBooking.id, type: 'hotel' }
    });

    res.status(201).json({
      success: true,
      message: 'Hotel booking created successfully',
      booking: hotelBooking,
      gamification: gamificationResult
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE BOOKING - For booking management functionality
router.put('/bookings/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    
    const updatedBooking = await prisma.travelBooking.update({
      where: { 
        id: id,
        userId: req.user.id
      },
      data: bookingData
    });

    res.json({
      success: true,
      message: 'Travel booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// CANCEL BOOKING - For booking management functionality
router.delete('/bookings/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    // Soft delete by updating status instead of hard delete
    const cancelledBooking = await prisma.travelBooking.update({
      where: { 
        id: id,
        userId: req.user.id
      },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Travel booking cancelled successfully',
      booking: cancelledBooking
    });
  } catch (error) {
    next(error);
  }
});

// UPLOAD DOCUMENT - For "Upload Document" quick action button
router.post('/documents', authenticateToken, async (req: any, res, next) => {
  try {
    const documentData = req.body;
    
    const document = await prisma.travelDocument.create({
      data: {
        ...documentData,
        // userId: req.user.id, // Add this field to TravelDocument model if needed
      }
    });

    res.status(201).json({
      success: true,
      message: 'Travel document uploaded successfully',
      document: document
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE DOCUMENT - For document management functionality
router.put('/documents/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    
    const updatedDocument = await prisma.travelDocument.update({
      where: { id: id },
      data: documentData
    });

    res.json({
      success: true,
      message: 'Travel document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    next(error);
  }
});

// DELETE DOCUMENT - For document management functionality
router.delete('/documents/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.travelDocument.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Travel document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PLAN ITINERARY - For "Plan Itinerary" quick action button
router.post('/itinerary', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Create Itinerary model in Prisma schema if not exists
    const itineraryData = req.body;
    
    res.status(501).json({
      success: false,
      message: 'Itinerary planning endpoint ready for implementation',
      data: itineraryData,
      note: 'Consider creating Itinerary model with relations to TravelBooking'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/itinerary', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Implement itinerary fetching logic
    const itineraries: any[] = []; // await prisma.itinerary.findMany({ where: { userId: req.user.id } });
    
    res.json({
      success: true,
      itineraries: itineraries,
      message: 'Itinerary management endpoint ready for implementation'
    });
  } catch (error) {
    next(error);
  }
});

// TRAVEL SEARCH & BOOKING ASSISTANCE - Additional helpful endpoints
router.get('/search/flights', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Integrate with flight search APIs (e.g., Amadeus, Skyscanner)
    const searchParams = req.query;
    
    res.status(501).json({
      success: false,
      message: 'Flight search endpoint ready for third-party API integration',
      searchParams: searchParams
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search/hotels', authenticateToken, async (req: any, res, next) => {
  try {
    // TODO: Integrate with hotel search APIs (e.g., Booking.com, Hotels.com)
    const searchParams = req.query;
    
    res.status(501).json({
      success: false,
      message: 'Hotel search endpoint ready for third-party API integration',
      searchParams: searchParams
    });
  } catch (error) {
    next(error);
  }
});

// End of future quick actions endpoints



export default router;