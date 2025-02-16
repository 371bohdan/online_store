export enum JwtTokenTypes {
    /**
     * Exist to provide an access to information, taking into account the role of the user
     */
    ACCESS = 'access',

    /**
     * For automatic user confirmation if token hasn't expired
     */
    REFRESH = 'refresh'
}