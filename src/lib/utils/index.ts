//Optional import util
export const optionalImport = async (packageName: string) => {
        try {
                const optionalPackage = await import(packageName);
                return optionalPackage
        }
        catch(e){
                console.log(`${packageName} not found. Make sure it is installed if you plan on using it`, e)

        }
}
