classDiagram
    %% Interfaces / core classes
    class IStorage {
      <<interface>>
      +getUser(id)
      +getUserByEmail(email)
      +getAllUsers()
      +createUser(user)
      +getAllReports()
      +getReport(id)
      +createReport(report)
      +updateReport(id, data)
      +getAllRewards()
      +createReward(reward)
      +updateReward(id, data)
      +deleteReward(id)
      +getAllBins()
      +createBin(bin)
      +updateBin(id, data)
      +deleteBin(id)
      +createTransaction(tx)
      +createNotification(n)
      +createRedemptionRequest(req)
      +getDashboardStats()
    }

    class DatabaseStorage {
      +getUser(id)
      +getUserByEmail(email)
      +getAllUsers()
      +createUser(insertUser)
      +getAllReports()
      +getReport(id)
      +createReport(insertReport)
      +updateReport(id, data)
      +getAllRewards()
      +createReward(insertReward)
      +updateReward(id, data)
      +deleteReward(id)
      +getAllBins()
      +createBin(insertBin)
      +updateBin(id, data)
      +deleteBin(id)
      +createTransaction(insertTransaction)
      +createNotification(insertNotification)
      +createRedemptionRequest(insertRequest)
      +getDashboardStats()
    }

    DatabaseStorage --|> IStorage

    class ServerApp {
      +start()
      +setupVite(httpServer, app)
      +serveStatic()
    }

    class ServerRoutes {
      +registerRoutes(httpServer, app)
      +seedAdmin()
      +(many endpoint handlers: /api/users/*, /api/admin/*, /api/bins, /api/stats, ...)
    }

    ServerApp --> ServerRoutes
    ServerRoutes --> DatabaseStorage

    class RewardsCalculator {
      +calculateRewardPoints(params)
      +calculateLevel(points)
    }
    ServerRoutes --> RewardsCalculator

    %% Domain entities (from shared/schema.ts)
    class User {
      +id: number
      +email: string
      +name: string
      +createdAt: timestamp
    }

    class Admin {
      +id: number
      +email: string
      +password: string
      +name: string
      +createdAt: timestamp
    }

    class Report {
      +id: number
      +userId: number
      +location: text
      +wasteType: string
      +amount: string
      +imageUrl: text?
      +verificationResult: jsonb?
      +status: string
      +createdAt: timestamp
      +collectorId: number?
    }

    class Reward {
      +id: number
      +userId: number
      +points: number
      +level: number
      +isAvailable: boolean
      +name: string
      +description: text?
      +collectionInfo: text
      +createdAt: timestamp
      +updatedAt: timestamp
    }

    class Transaction {
      +id: number
      +userId: number
      +type: string
      +amount: number
      +description: text
      +date: timestamp
    }

    class Bin {
      +id: number
      +location: text
      +latitude: text
      +longitude: text
      +capacity: string
      +status: string
      +createdAt: timestamp
    }

    class RedemptionRequest {
      +id: number
      +userId: number
      +points: number
      +bankName: string
      +accountNumber: string
      +accountHolder: string
      +status: string
      +reason: text?
      +rejectionReason: text?
      +createdAt: timestamp
      +approvedAt: timestamp?
    }

    class Notification {
      +id: number
      +userId: number
      +message: text
      +type: string
      +isRead: boolean
      +createdAt: timestamp
    }

    class CollectedWaste {
      +id: number
      +reportId: number
      +collectorId: number
      +collectionDate: timestamp
      +status: string
    }

    %% Relationships
    User "1" --> "*" Report : "submits"
    User "1" --> "*" Reward : "has"
    User "1" --> "*" Transaction : "has"
    User "1" --> "*" Notification : "receives"
    User "1" --> "*" RedemptionRequest : "requests"
    Report "0..1" --> "1" User : "collector"
    Report "1" --> "0..1" CollectedWaste : "collected_as"
    Bin "1" --> "*" CollectedWaste : "used_by"
