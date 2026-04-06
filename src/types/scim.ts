export interface ScimMeta {
  resourceType: string
  created: string
  lastModified: string
  location: string
  version: string
}

export interface ScimEmail {
  value: string
  type: string
  primary: boolean
  display?: string
}

export interface ScimPhoneNumber {
  value: string
  type: string
  primary: boolean
}

export interface ScimName {
  formatted?: string
  familyName?: string
  givenName?: string
  middleName?: string
  honorificPrefix?: string
  honorificSuffix?: string
}

export interface ScimUser {
  id: string
  externalId?: string
  userName: string
  name?: ScimName
  displayName?: string
  nickName?: string
  profileUrl?: string
  title?: string
  userType?: string
  preferredLanguage?: string
  locale?: string
  timezone?: string
  active: boolean
  emails?: ScimEmail[]
  phoneNumbers?: ScimPhoneNumber[]
  meta: ScimMeta
}

export interface ScimGroupMember {
  value: string
  display?: string
  type?: string
}

export interface ScimGroup {
  id: string
  externalId?: string
  displayName: string
  members?: ScimGroupMember[]
  meta: ScimMeta
}

export interface ScimListResponse<T> {
  totalResults: number
  startIndex: number
  itemsPerPage: number
  Resources: T[]
}

export interface AuditLog {
  id: string
  correlationId: string
  actorId?: string
  action: string
  targetUserId?: string
  targetGroupId?: string
  detail?: string
  timestamp: string
  outcome: 'SUCCESS' | 'FAILURE'
}

export interface CertificationCampaign {
  id: string
  name: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
  createdAt: string
  deadline: string
  reviewerId?: string
  targetUserId?: string
  decision?: 'APPROVE' | 'REVOKE'
  decidedAt?: string
}

export interface ProvisioningEvent {
  id: string
  eventType: string
  resourceType: 'User' | 'Group'
  resourceId: string
  resourceName?: string
  timestamp: string
  source?: string
  correlationId?: string
  detail?: string
}
