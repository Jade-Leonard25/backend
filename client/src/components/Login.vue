<script lang="ts">
let email = '';
let password = ''
interface loginProps {
    email: string;
    password: string;

}
const handleSubmit = async (props: loginProps) => {
    try {
        const data = await fetch('http://localhost:4000',{
            
        })
    } catch (error) {
        
    }
}
</script>