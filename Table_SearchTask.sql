USE [MRFSQuery]
GO

/****** Object:  Table [dbo].[Table_SearchTask]    Script Date: 1/4/2021 5:28:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Table_SearchTask](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[SearchId] [varchar](50) NULL,
	[Name] [varchar](100) NULL,
	[CreateDate] [datetime] NULL,
    [Status] [varchar](10) NULL,
 CONSTRAINT [PK_Table_SearchTask] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


