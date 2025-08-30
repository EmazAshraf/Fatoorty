import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import Table from '../../models/Table.js';
import Staff from '../../models/Staff.js';
import Restaurant from '../../models/Restaurant.js';
import QRCode from 'qrcode';
import config from '../config/index.js';

const getFrontendOrigin = () => {
  // Use environment variable if available, otherwise default to localhost
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
  
};

export const listTables = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '', // 'occupied' | 'available'
    waiterId = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  const query = { restaurantId: restaurant._id, isDeleted: false };
  if (search) {
    // Handle search for table numbers (both exact number and partial matches)
    const searchNum = Number(search);
    if (!isNaN(searchNum)) {
      // If search is a number, search for exact table number
      query.tableNumber = searchNum;
    } else {
      // If search is not a number, search for partial matches in table number as string
      query.tableNumber = { $regex: search, $options: 'i' };
    }
  }
  if (status) {
    if (status === 'occupied') query.isOccupied = true;
    if (status === 'available') query.isOccupied = false;
  }
  if (waiterId) {
    query.waiterId = waiterId;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [tables, totalCount] = await Promise.all([
    Table.find(query).sort(sort).skip(skip).limit(limitNum).populate('waiterId', 'name email position status').lean(),
    Table.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  res.json(createSuccessResponse(
    'Tables retrieved successfully',
    tables,
    {
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    }
  ));
});

export const listWaiters = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }
  const waiters = await Staff.find({ restaurantId: restaurant._id, isDeleted: false, position: 'waiter', status: 'active' })
    .select('_id name email')
    .lean();
  res.json(createSuccessResponse('Waiters retrieved successfully', waiters));
});

export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity = 4, waiterId, status } = req.body;

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  // Validate table number as number
  if (!tableNumber || !Number.isFinite(Number(tableNumber))) {
    return res.status(400).json(createErrorResponse('Table number must be a valid number', 400));
  }
  
  const tableNum = Number(tableNumber);
  if (!Number.isInteger(tableNum) || tableNum < 1 || tableNum > 200) {
    return res.status(400).json(createErrorResponse('Table number must be a whole number between 1 and 200', 400));
  }

  // Enforce waiter assignment
  if (!waiterId) {
    return res.status(400).json(createErrorResponse('Waiter is required for a table', 400));
  }

  // Validate capacity range
  const cap = Number(capacity);
  if (!Number.isFinite(cap) || cap < 1 || cap > 30) {
    return res.status(400).json(createErrorResponse('Table capacity must be between 1 and 30', 400));
  }

  // Ensure unique table number within restaurant
  const duplicate = await Table.findOne({ restaurantId: restaurant._id, tableNumber: tableNum, isDeleted: false });
  if (duplicate) {
    return res.status(400).json(createErrorResponse(`Table number ${tableNum} already exists`, 400));
  }

  // Validate waiter
  const waiter = await Staff.findOne({ _id: waiterId, restaurantId: restaurant._id, isDeleted: false });
  if (!waiter) {
    return res.status(404).json(createErrorResponse('Waiter not found', 404));
  }
  if (waiter.position !== 'waiter') {
    return res.status(400).json(createErrorResponse('Only waiters can be assigned to tables', 400));
  }
  if (waiter.status !== 'active') {
    return res.status(400).json(createErrorResponse('Cannot assign inactive staff to a table', 400));
  }

  // Create placeholder first to get _id
  const table = new Table({
    restaurantId: restaurant._id,
    tableNumber: tableNum,
    capacity: cap || 4,
    waiterId,
    isOccupied: status === 'occupied',
    qrCodeUrl: 'pending',
  });

  await table.save();

  // Generate QR URL and update
  const frontendOrigin = getFrontendOrigin();
  const base = `${frontendOrigin}`;
  const version = Date.now();
  const qrUrl = `${table.generateQRUrl(base)}&v=${version}`;
  table.qrCodeUrl = qrUrl;
  await table.save();

  res.status(201).json(createSuccessResponse('Table created successfully', table));
});

export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, capacity, waiterId, status } = req.body;

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  const table = await Table.findOne({ _id: id, restaurantId: restaurant._id, isDeleted: false });
  if (!table) {
    return res.status(404).json(createErrorResponse('Table not found', 404));
  }

  if (tableNumber !== undefined) {
    // Validate table number as number
    if (!Number.isFinite(Number(tableNumber))) {
      return res.status(400).json(createErrorResponse('Table number must be a valid number', 400));
    }
    
    const tableNum = Number(tableNumber);
    if (!Number.isInteger(tableNum) || tableNum < 1 || tableNum > 200) {
      return res.status(400).json(createErrorResponse('Table number must be a whole number between 1 and 200', 400));
    }
    
    const duplicate = await Table.findOne({ restaurantId: restaurant._id, tableNumber: tableNum, isDeleted: false, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json(createErrorResponse(`Table number ${tableNum} already exists`, 400));
    }
    table.tableNumber = tableNum;
  }

  if (capacity !== undefined) {
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap < 1 || cap > 30) {
      return res.status(400).json(createErrorResponse('Table capacity must be between 1 and 30', 400));
    }
    table.capacity = cap;
  }

  if (waiterId !== undefined) {
    if (!waiterId) {
      return res.status(400).json(createErrorResponse('Waiter is required for a table', 400));
    }
    const waiter = await Staff.findOne({ _id: waiterId, restaurantId: restaurant._id, isDeleted: false });
    if (!waiter) {
      return res.status(404).json(createErrorResponse('Waiter not found', 404));
    }
    if (waiter.position !== 'waiter') {
      return res.status(400).json(createErrorResponse('Only waiters can be assigned to tables', 400));
    }
    if (waiter.status !== 'active') {
      return res.status(400).json(createErrorResponse('Cannot assign inactive staff to a table', 400));
    }
    table.waiterId = waiterId;
  }
  if (status !== undefined) table.isOccupied = status === 'occupied';

  await table.save();
  res.json(createSuccessResponse('Table updated successfully', table));
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  const table = await Table.findOne({ _id: id, restaurantId: restaurant._id, isDeleted: false });
  if (!table) {
    return res.status(404).json(createErrorResponse('Table not found', 404));
  }

  table.isDeleted = true;
  await table.save();
  res.json(createSuccessResponse('Table deleted successfully', { id }));
});


export const downloadQRCodeImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { size = 512 } = req.query;
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  const table = await Table.findOne({ _id: id, restaurantId: restaurant._id, isDeleted: false });
  if (!table) {
    return res.status(404).json(createErrorResponse('Table not found', 404));
  }

  const pngBuffer = await QRCode.toBuffer(table.qrCodeUrl, { width: Math.min(parseInt(size) || 512, 1024), color: { dark: '#6D72CF', light: '#fff' } });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment: filename=table-${table.tableNumber}-qr.png`);
  res.send(pngBuffer);
});



