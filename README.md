# RedLens - Crime Analysis & Safety Mapping System

A comprehensive GIS-powered crime analysis platform for Bengaluru that enables citizens to report crimes, administrators to manage data, and analysts to generate insights through advanced safety scoring and hotspot detection.

## Project Overview
RedLens is a full-stack web application that bridges the gap between public safety concerns and data-driven crime prevention. 

The platform provides: 
- Real-time crime mapping with interactive visualization
- Citizen reporting system for crowdsourced crime data
- Admin verification workflow to maintain data integrity
- Safety score calculations for different areas
- Hotspot detection for high-crime zones
- Analytics dashboard with comprehensive reports

## Architecture
### Frontend

Framework: React with TypeScript <br>
Styling: Tailwind CSS <br>
State Management: React Hooks (useState) <br>
Interactive maps - Leaflet

### Backend

Runtime: Node.js with Express.js <br>
Database: MySQL 8.0+ <br>
API: RESTful architecture <br>
ORM: mysql2/promise for connection pooling <br>

### Database Features

GIS Support: Latitude/Longitude with 6 decimal precision <br>
Stored Procedures and Functions: Complex business logic encapsulation <br>
Triggers: Automated audit logging and data validation <br>
Views: Optimized queries for common reports <br>
Events: Scheduled tasks for maintenance <br> 


## User Roles & Permissions

<img width="1919" height="1131" alt="image" src="https://github.com/user-attachments/assets/116462bf-32ac-43ed-b3df-8cd008b522d3" />

Public Users

- View crime map and statistics <br>
- Report crimes <br>
- View their submission history <br>
- Access safety scores <br>

<img width="1306" height="651" alt="image" src="https://github.com/user-attachments/assets/e4d14624-d0f4-4f30-9832-30e255d6c86e" />

Analysts

- All Public permissions <br>
- Generate detailed reports <br>
- Calculate safety scores <br>
- Identify hotspots <br>
- View comprehensive analytics <br>

<img width="1493" height="732" alt="image" src="https://github.com/user-attachments/assets/4ecfc359-6476-4977-9630-5bd60038af4b" />
<img width="1483" height="728" alt="image" src="https://github.com/user-attachments/assets/aa1ae2e3-952f-483d-8c93-563749bc5c62" />

Admin

- All Analyst permissions <br>
- Verify/reject citizen reports <br>
- Manage user accounts <br>
- Modify crime records <br>
- Access audit logs <br>

<img width="1486" height="733" alt="image" src="https://github.com/user-attachments/assets/e326528a-372a-468f-bd0b-d4f5f2a94e43" />
<img width="1483" height="721" alt="image" src="https://github.com/user-attachments/assets/a108ccd4-33fb-41c2-8c84-c2f3c55a1340" />

## Future Enhancements

 -> Real-time WebSocket notifications <br>
 -> Machine learning for crime prediction <br>
 -> Mobile application (React Native) <br>
 -> Multi-language support <br>
 -> Advanced GIS features (heatmaps, clustering) <br>
 -> PDF report generation <br>
 -> Email notifications for report status <br>
 -> Social media integration <br>
 -> Public API for data access <br>

